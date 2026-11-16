import { Star } from 'lucide-react';

export default function MovieCard({ movie }) {
  return (
    <div className="group cursor-pointer flex flex-col space-y-2">
      {/* Poster Image Container */}
      <div 
        className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-200 border border-[var(--border-color)] transition-all duration-300"
        style={{
          boxShadow: 'var(--card-shadow)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--card-shadow)'}
      >
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Promoted Tag */}
        {movie.isPromoted && (
          <span className="absolute top-2 left-2 bg-[var(--accent-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm">
            Promoted
          </span>
        )}

        {/* Rating Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-2.5 pt-6 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1 font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{movie.rating}/10</span>
          </div>
          <span className="text-[10px] text-slate-300 font-medium">{movie.votes} votes</span>
        </div>
      </div>

      {/* Metadata */}
      <div className="space-y-1 px-1">
        <h3 className="font-bold text-sm text-[var(--text-main)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">
          {movie.title}
        </h3>
        
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
          <span className="px-1.5 py-0.5 bg-[var(--bg-subtle)] rounded border border-[var(--border-color)] text-[10px] text-slate-600 font-semibold">
            {movie.censor}
          </span>
          <span className="truncate">{movie.languages.join(', ')}</span>
        </div>
      </div>
    </div>
  );
}