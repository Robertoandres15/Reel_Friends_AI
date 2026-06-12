"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, User, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FriendRecommendations } from "@/components/friend-recommendations";
import { createClient } from "@/lib/supabase/client";
import { MobileNavigation } from "@/components/mobile-navigation";
import { DismissibleMovieSuggestions } from "@/components/dismissible-movie-suggestions";
import { ReelClubMatches } from "@/components/reel-club-matches";
import { PageLoader } from "@/components/page-loader";

const FALLBACK_MOVIES = [
  {
    id: 550,
    title: "Fight Club",
    overview:
      "An insomniac office worker and a devil-may-care soap maker form an underground fight club.",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    vote_average: 8.4,
    release_date: "1999-10-15",
  },
  {
    id: 13,
    title: "Forrest Gump",
    overview:
      "The presidencies of Kennedy and Johnson, Vietnam, Watergate, and other history unfold through the perspective of an Alabama man.",
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    vote_average: 8.5,
    release_date: "1994-07-06",
  },
  {
    id: 155,
    title: "The Dark Knight",
    overview:
      "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
    poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    vote_average: 9.0,
    release_date: "2008-07-18",
  },
  {
    id: 680,
    title: "Pulp Fiction",
    overview:
      "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
    poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    vote_average: 8.9,
    release_date: "1994-10-14",
  },
];

const DEFAULT_GENRES = ["28", "12", "878", "35"]; // Action, Adventure, Sci-Fi, Comedy

function AIMovieSuggestions({ userProfile }: { userProfile: any }) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [movieGenres, setMovieGenres] = useState<string[]>(DEFAULT_GENRES);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      let genres = DEFAULT_GENRES;
      let personalized = false;

      if (
        userProfile?.preferred_movie_genres &&
        userProfile.preferred_movie_genres.length > 0
      ) {
        genres = userProfile.preferred_movie_genres;
        personalized = true;
      }

      try {
        const page = Math.floor(Math.random() * 5) + 1;
        const res = await fetch(
          `/api/tmdb/discover?with_genres=${genres.join(",")}&sort_by=popularity.desc&page=${page}`,
        );
        if (res.ok) {
          const data = await res.json();
          const results = (data.results || []).slice(0, 10);
          if (active && results.length > 0) {
            setSuggestions(results);
            setMovieGenres(genres);
            setIsPersonalized(personalized);
            setLoading(false);
            return;
          }
        }
      } catch {
        // fall through to fallback below
      }

      if (active) {
        setSuggestions(FALLBACK_MOVIES);
        setMovieGenres(genres);
        setIsPersonalized(personalized);
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [userProfile]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <DismissibleMovieSuggestions
      initialSuggestions={suggestions}
      movieGenres={movieGenres}
      userProfile={userProfile}
      isPersonalized={isPersonalized}
    />
  );
}

export default function FeedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("username, preferred_movie_genres, preferred_series_genres")
        .eq("id", user.id)
        .single();

      if (!profile?.username) {
        router.replace("/onboarding");
        return;
      }

      if (active) {
        setUserProfile(profile);
        setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen pt-[var(--safe-area-inset-top)] pb-[var(--safe-area-inset-bottom)] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 pb-20 md:pb-8">
        <header className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Castd logo"
              width={32}
              height={32}
              className="h-7 w-7 sm:h-8 sm:w-8"
              priority
            />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Castd</h1>
          </div>
          <nav className="hidden md:flex gap-2">
            <Button
              variant="ghost"
              asChild
              className="text-white hover:bg-white/10"
            >
              <Link href="/explore">
                <Search className="h-4 w-4 mr-2" />
                Explore
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="text-white hover:bg-white/10"
            >
              <Link href="/friends">
                <Users className="h-4 w-4 mr-2" />
                Friends
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="text-white hover:bg-white/10"
            >
              <Link href="/lists">
                <Plus className="h-4 w-4 mr-2" />
                Lists
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="text-white hover:bg-white/10"
            >
              <Link href="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
          </nav>
        </header>

        <div className="max-w-2xl mx-auto">
          <Tabs defaultValue="following" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/5 border-white/10 h-12 sm:h-10">
              <TabsTrigger
                value="following"
                className="data-[state=active]:bg-purple-600 text-xs sm:text-sm min-h-[44px] sm:min-h-[36px]"
              >
                Following
              </TabsTrigger>
              <TabsTrigger
                value="reel-club"
                className="data-[state=active]:bg-purple-600 text-xs sm:text-sm min-h-[44px] sm:min-h-[36px]"
              >
                Reel Club
              </TabsTrigger>
              <TabsTrigger
                value="recommendations"
                className="data-[state=active]:bg-purple-600 text-xs sm:text-sm min-h-[44px] sm:min-h-[36px]"
              >
                For You
              </TabsTrigger>
            </TabsList>

            <TabsContent value="following" className="mt-6">
              <FriendRecommendations />
            </TabsContent>

            <TabsContent value="reel-club" className="mt-6">
              <ReelClubMatches />
            </TabsContent>

            <TabsContent value="recommendations" className="mt-6">
              <AIMovieSuggestions userProfile={userProfile} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
}
