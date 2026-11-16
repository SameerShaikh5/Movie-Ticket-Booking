import React, { useState, useEffect } from 'react';
import { Flame, ChevronRight, ChevronLeft, Film, Star, Play, Loader2 } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router';
import { getShows } from '../apis/show.api.js';

export default function Home() {
  const { searchQuery } = useOutletContext();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const navigate = useNavigate();

  // State for fetched shows, loading, and errors
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch shows on component mount
  useEffect(() => {
    const fetchShowsData = async () => {
      try {
        setIsLoading(true);
        const response = await getShows();
        const showsList = response?.data.shows || response || [];
        setShows(showsList);
      } catch (error) {
        setErrorMessage('Failed to load shows.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowsData();
  }, []);

  // Dynamic Banner slides derived from fetched shows (fallback to empty if loading)
  const bannerSlides = shows.slice(0, 3);

  // Banner auto-slider timer
  useEffect(() => {
    if (bannerSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const genres = ['All', 'Action', 'Comedy', 'Drama', 'Thriller', 'Crime', 'Sci-Fi', 'Mythology'];
  const formats = ['All', '2D', '3D', 'IMAX 3D', '4DX'];

  // Search & Filter Logic: Search is independent (searches all shows), genre/format apply as secondary filters
  const searchedMovies = shows.filter((show) => {
    return show.movieTitle?.toLowerCase().includes((searchQuery || '').toLowerCase());
  });

  // If user is actively searching, show search results across all items; otherwise apply genre/format filters
  const filteredMovies = searchQuery ? searchedMovies : shows.filter((show) => {
    const matchesGenre = selectedGenre === 'All' || show.genre?.includes(selectedGenre);
    
    // Normalize format comparison to handle spacing variations (e.g., "IMAX3D" vs "IMAX 3D")
    const normalizedShowFormat = (show.format || '').replace(/\s+/g, '').toLowerCase();
    const normalizedSelectedFormat = selectedFormat.replace(/\s+/g, '').toLowerCase();
    const matchesFormat = selectedFormat === 'All' || normalizedShowFormat.includes(normalizedSelectedFormat);

    return matchesGenre && matchesFormat;
  });

  const displayedMovies = filteredMovies.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      {/* 1. Dynamic Hero Banner Slider */}
      {bannerSlides.length > 0 && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl group">
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/20"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/20"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {bannerSlides.map((slide) => (
              <div key={slide._id} className="w-full shrink-0 p-6 sm:p-10 md:p-12 min-h-[360px]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto">
                  <div className="space-y-4 max-w-xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      <Flame className="w-3.5 h-3.5" /> Now Screening • {slide.format}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                      {slide.movieTitle}
                    </h1>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed line-clamp-2">
                      {slide.description}
                    </p>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => navigate(`/show/${slide._id}`)}
                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
                      >
                        Book Tickets Now
                      </button>
                      <button
                        onClick={() => navigate(`/show/${slide._id}`)}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-medium text-sm rounded-xl backdrop-blur-md transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Play className="w-4 h-4 fill-current text-rose-400" /> View Details
                      </button>
                    </div>
                  </div>

                  <div className="w-40 sm:w-48 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/20 shrink-0">
                    <img src={slide.posterImage} alt={slide.movieTitle} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {bannerSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${currentSlide === idx ? 'w-6 bg-rose-500' : 'w-2 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Light Filter Pills Bar */}
      <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Genre:</span>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${selectedGenre === genre ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">Format:</span>
          {formats.map((fmt) => (
            <button
              key={fmt}
              onClick={() => setSelectedFormat(fmt)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${selectedFormat === fmt ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {fmt}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Recommended Movies Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Recommended Movies'}
          </h2>
          <span className="text-xs text-slate-500 font-medium">Showing {displayedMovies.length} of {filteredMovies.length} movies</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3 bg-white rounded-2xl border border-slate-200">
            <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Loading Upcoming Shows...</p>
          </div>
        ) : errorMessage ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-rose-300 text-rose-600 text-xs font-semibold">
            {errorMessage}
          </div>
        ) : displayedMovies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5">
              {displayedMovies.map((movie) => (
                <div
                  key={movie._id}
                  onClick={() => navigate(`/show/${movie._id}`)}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-rose-500/60 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
                >
                  <div className="aspect-[2/3] overflow-hidden relative bg-slate-100">
                    <img src={movie.posterImage} alt={movie.movieTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                    <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {movie.rating}
                    </div>

                    <span className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-slate-800 border border-slate-200 shadow-sm">
                      {movie.censor}
                    </span>
                  </div>

                  <div className="p-4 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate group-hover:text-rose-600 transition-colors">{movie.movieTitle}</h3>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {movie.genre?.join(', ')} • {movie.format}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {visibleCount < filteredMovies.length && (
              <div className="text-center pt-6">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 4)}
                  className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Load More Movies ↓
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <Film className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No movies found matching your criteria.</p>
          </div>
        )}
      </section>

    </div>
  );
}