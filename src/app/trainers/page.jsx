'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/auth';
import { trainers as trainersApi, users as usersApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Search, MapPin, Star, DollarSign, Filter, X,
  SlidersHorizontal, Loader2, ChevronDown, Award, Crosshair, Target, Shield, Zap
} from 'lucide-react';

function TrainersContent() {
  const { user } = useAuth();
  const [trainerList, setTrainerList] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const [userCity, setUserCity] = useState('');
  const [locating, setLocating] = useState(false);
  const [filters, setFilters] = useState({
    specialty: '',
    location: '',
    minRate: '',
    maxRate: '',
    search: '',
    trainingStyle: 'ALL',
    sort: 'best',
  });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    loadTrainers();
    loadSpecialties();
  }, []);

  useEffect(() => {
    loadTrainers();
  }, [filters.specialty, filters.location, filters.minRate, filters.maxRate, filters.trainingStyle, filters.sort, coords]);

  const loadTrainers = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort: filters.sort };
      if (filters.specialty) params.specialty = filters.specialty;
      if (filters.location) params.location = filters.location;
      if (filters.minRate) params.minRate = filters.minRate;
      if (filters.maxRate) params.maxRate = filters.maxRate;
      if (filters.search) params.search = filters.search;
      if (filters.trainingStyle && filters.trainingStyle !== 'ALL') params.trainingStyle = filters.trainingStyle;
      if (coords) { params.lat = coords.lat; params.lng = coords.lng; }

      const data = await trainersApi.list(params);
      setTrainerList(data.trainers);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSpecialties = async () => {
    try {
      const data = await trainersApi.specialties();
      setSpecialties(data);
    } catch (err) { console.error(err); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadTrainers(1);
  };

  const clearFilters = () => {
    setFilters({ specialty: '', location: '', minRate: '', maxRate: '', search: '', trainingStyle: 'ALL', sort: 'best' });
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setCoords({ lat: latitude, lng: longitude });
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || '';
        if (city) { setUserCity(city); setFilters(f => ({ ...f, location: city })); }
      } catch {}
      toast.success(`Location set — showing trainers within 5km`);
      setLocating(false);
    }, () => { setLocating(false); toast.error('Could not detect location'); }, { enableHighAccuracy: true });
  };

  const hasFilters = filters.specialty || filters.location || filters.minRate || filters.maxRate || filters.trainingStyle !== 'ALL';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Find Your <span className="text-gradient">Trainer</span></h1>
          <p className="text-dark-400 mt-1">Browse expert trainers matched to your goals</p>
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-sm text-dark-300 hover:text-white hover:border-dark-600 transition-all lg:hidden"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-primary-400" />}
        </button>
      </div>

      <div className="flex gap-6">
        <aside className={`lg:w-72 flex-shrink-0 ${filtersOpen ? 'fixed inset-0 z-50 lg:relative lg:inset-auto' : 'hidden lg:block'}`}>
          <div className={`${filtersOpen ? 'fixed inset-0 bg-dark-950/80 backdrop-blur-sm' : 'hidden lg:hidden'}`} onClick={() => setFiltersOpen(false)} />
          <div className={`${filtersOpen ? 'fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] z-50 overflow-y-auto' : ''} bg-dark-800/50 border border-dark-700/50 rounded-2xl p-5 ${filtersOpen ? '' : 'lg:sticky lg:top-24'}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>
              <div className="flex items-center gap-2">
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-dark-400 hover:text-primary-400">
                    Clear all
                  </button>
                )}
                {filtersOpen && (
                  <button onClick={() => setFiltersOpen(false)} className="lg:hidden text-dark-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search trainers..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-900/50 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
            </form>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-dark-400 mb-1.5">Goal / Training Style</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { value: 'ALL', label: 'All', icon: Target },
                    { value: 'BULK', label: 'Bulk', icon: Shield },
                    { value: 'LEAN', label: 'Lean', icon: Zap },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setFilters({ ...filters, trainingStyle: opt.value })}
                      className={`flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium rounded-xl border transition-all ${
                        filters.trainingStyle === opt.value
                          ? 'border-primary-500 bg-primary-500/10 text-primary-400'
                          : 'border-dark-700 bg-dark-900/50 text-dark-400 hover:text-dark-200'
                      }`}>
                      <opt.icon className="w-3 h-3" /> {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-dark-400 mb-1.5">Sort By</label>
                <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                  className="w-full px-3 py-2.5 bg-dark-900/50 border border-dark-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                  <option value="best">Best Match</option>
                  <option value="distance">Nearest</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="experience">Most Experienced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-dark-400 mb-1.5">Specialty</label>
                <select value={filters.specialty} onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                  className="w-full px-3 py-2.5 bg-dark-900/50 border border-dark-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50">
                  <option value="">All Specialties</option>
                  {specialties.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-dark-400">Nearby (5km)</label>
                  <button type="button" onClick={detectLocation} disabled={locating}
                    className="text-[10px] text-primary-400 hover:text-primary-300 flex items-center gap-0.5 disabled:opacity-50">
                    <Crosshair className="w-3 h-3" /> {locating ? 'Locating...' : coords ? 'Refresh' : 'Detect'}
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                  <input type="text" placeholder="City or area..."
                    value={filters.location}
                    onChange={(e) => {
                      setFilters({ ...filters, location: e.target.value });
                      if (!e.target.value) setCoords(null);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-900/50 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                </div>
                {coords && (
                  <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {userCity || 'Location set'} · 5km radius active
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-dark-400 mb-1.5">Hourly Rate</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-400" />
                    <input type="number" placeholder="Min" value={filters.minRate}
                      onChange={(e) => setFilters({ ...filters, minRate: e.target.value })}
                      className="w-full pl-8 pr-3 py-2.5 bg-dark-900/50 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                  </div>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-400" />
                    <input type="number" placeholder="Max" value={filters.maxRate}
                      onChange={(e) => setFilters({ ...filters, maxRate: e.target.value })}
                      className="w-full pl-8 pr-3 py-2.5 bg-dark-900/50 border border-dark-700 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                  </div>
                </div>
              </div>
            </div>

            {filtersOpen && (
              <button onClick={() => setFiltersOpen(false)}
                className="w-full mt-5 py-2.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-500/20 transition-all lg:hidden">
                Apply Filters
              </button>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
            </div>
          ) : trainerList.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No trainers found</h3>
              <p className="text-dark-400 mb-4">Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-dark-400">
                  Showing {trainerList.length} of {pagination.total} trainers
                  {filters.sort === 'best' && pagination.total > 0 && ' · Sorted by best match'}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {trainerList.map((trainer, i) => (
                    <motion.div key={trainer.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <Link href={`/trainers/${trainer.id}`} className="block bg-dark-800/30 border border-dark-700/30 rounded-2xl p-5 card-hover h-full">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xl font-bold text-white flex-shrink-0 overflow-hidden">
                            {trainer.avatar ? <img src={trainer.avatar} alt="" className="w-full h-full object-cover" /> : trainer.name?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-semibold text-white truncate">{trainer.name}</h3>
                              {trainer.score > 0 && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                                  {trainer.score}% match
                                </span>
                              )}
                            </div>
                            {trainer.location && (
                              <p className="text-xs text-dark-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {trainer.location}
                                {trainer.locationMatch && <span className="text-green-400 text-[10px] ml-1">· {trainer.distance}km</span>}
                              </p>
                            )}
                          </div>
                          {trainer.avgRating && (
                            <div className="flex items-center gap-1 text-amber-400 text-sm">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-medium">{trainer.avgRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {trainer.specialties?.slice(0, 3).map((s) => (
                            <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
                              {s}
                            </span>
                          ))}
                          {trainer.specialties?.length > 3 && (
                            <span className="text-xs px-2.5 py-1 rounded-full bg-dark-700 text-dark-300">
                              +{trainer.specialties.length - 3}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-dark-700/30">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-primary-400" />
                            <span className="text-sm text-dark-300">{trainer.experience} yrs</span>
                            {trainer.trainingStyle && trainer.trainingStyle !== 'BOTH' && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                trainer.trainingStyle === 'BULK' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {trainer.trainingStyle}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-primary-400">
                            ${trainer.hourlyRate}<span className="text-dark-500 text-xs font-normal">/hr</span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button onClick={() => loadTrainers(pagination.page - 1)} disabled={pagination.page <= 1}
                    className="px-4 py-2 text-sm bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => loadTrainers(p)}
                      className={`w-9 h-9 text-sm rounded-xl font-medium transition-all ${
                        p === pagination.page
                          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                          : 'bg-dark-800/50 border border-dark-700/50 text-dark-300 hover:text-white'
                      }`}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => loadTrainers(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}
                    className="px-4 py-2 text-sm bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrainersPage() {
  return (
    <ProtectedRoute>
      <TrainersContent />
    </ProtectedRoute>
  );
}
