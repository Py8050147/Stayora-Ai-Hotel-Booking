"use client";

import { useEffect, useState, useMemo } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Heart,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  X,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sun,
  Wind,
  Coffee,
  Anchor,
} from 'lucide-react';
import Link from 'next/link';

type Hotel = {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
  country: string;
  description: string;
  starRating: number;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  imageUrl: string;
  tags: string[];
  amenities: string[];
};

type Room = {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  maxAdults: number;
  bedType: string;
  pricePerNight: number;
  availableRooms: number;
};

const formatMoney = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const demoHotels: Hotel[] = [
  {
    id: 'hotel-1',
    slug: 'stayora-grand-patna',
    name: 'Stayora Grand Patna',
    city: 'Patna',
    state: 'Bihar',
    country: 'India',
    description: 'A comfortable business and family hotel close to Gandhi Maidan and the railway station. Experience luxury with our premium amenities and excellent service.',
    starRating: 4,
    rating: 4.8,
    reviewCount: 128,
    priceFrom: 3800,
    imageUrl: 'https://images.pexels.com/photos/39836720/pexels-photo-39836720.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Luxury', 'City Center', 'Business Friendly'],
    amenities: ['Free WiFi', 'Free Breakfast', 'Free Parking', 'Air Conditioning', 'Restaurant', '24h Front Desk'],
  },
  {
    id: 'hotel-2',
    slug: 'ganga-view-residency',
    name: 'Ganga View Residency',
    city: 'Patna',
    state: 'Bihar',
    country: 'India',
    description: 'Budget friendly rooms with a calm view of the Ganga and easy access to the city centre. Perfect for spiritual retreats and peaceful stays.',
    starRating: 3,
    rating: 4.5,
    reviewCount: 89,
    priceFrom: 2400,
    imageUrl: 'https://images.pexels.com/photos/7821349/pexels-photo-7821349.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['River View', 'Budget', 'Spiritual'],
    amenities: ['Free WiFi', 'Free Breakfast', 'Air Conditioning', '24h Front Desk', 'Room Service'],
  },
  {
    id: 'hotel-3',
    slug: 'sea-breeze-resort',
    name: 'Sea Breeze Resort',
    city: 'Goa',
    state: 'Goa',
    country: 'India',
    description: 'Beachfront resort with a pool, spa and sunset dining, a short walk from Calangute beach. The ultimate Goan getaway.',
    starRating: 5,
    rating: 4.9,
    reviewCount: 256,
    priceFrom: 9500,
    imageUrl: 'https://images.pexels.com/photos/8134808/pexels-photo-8134808.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Beachfront', 'Luxury', 'Resort'],
    amenities: ['Free WiFi', 'Swimming Pool', 'Free Breakfast', 'Spa', 'Restaurant', 'Gym', 'Airport Shuttle'],
  },
  {
    id: 'hotel-4',
    slug: 'marine-drive-suites',
    name: 'Marine Drive Suites',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    description: 'Elegant sea facing suites on Marine Drive, minutes from South Mumbai\'s landmarks. Experience the city\'s finest accommodation.',
    starRating: 5,
    rating: 4.7,
    reviewCount: 178,
    priceFrom: 12500,
    imageUrl: 'https://images.pexels.com/photos/10923534/pexels-photo-10923534.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Ocean View', 'Luxury', 'City Life'],
    amenities: ['Free WiFi', 'Swimming Pool', 'Gym', 'Spa', 'Restaurant', 'Room Service', '24h Front Desk'],
  },
  {
    id: 'hotel-5',
    slug: 'conaught-central-inn',
    name: 'Connaught Central Inn',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    description: 'Modern hotel in the heart of Connaught Place with metro access at the doorstep. Perfect for business and leisure travelers.',
    starRating: 4,
    rating: 4.6,
    reviewCount: 142,
    priceFrom: 6200,
    imageUrl: 'https://images.pexels.com/photos/28999491/pexels-photo-28999491.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['City Center', 'Business', 'Modern'],
    amenities: ['Free WiFi', 'Free Breakfast', 'Air Conditioning', 'Restaurant', 'Airport Shuttle', '24h Front Desk'],
  },
  {
    id: 'hotel-6',
    slug: 'pink-city-haveli',
    name: 'Pink City Haveli',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    description: 'A restored haveli with courtyard dining, rooftop views and Rajasthani hospitality. Step into royal heritage.',
    starRating: 4,
    rating: 4.8,
    reviewCount: 198,
    priceFrom: 5200,
    imageUrl: 'https://images.pexels.com/photos/34645081/pexels-photo-34645081.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Heritage', 'Cultural', 'Luxury'],
    amenities: ['Free WiFi', 'Swimming Pool', 'Free Breakfast', 'Restaurant', 'Free Parking', 'Pet Friendly'],
  },
  {
    id: 'hotel-7',
    slug: 'garden-city-business-hotel',
    name: 'Garden City Business Hotel',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    description: 'Business hotel near MG Road with meeting rooms, fast WiFi and a rooftop restaurant. The perfect urban base.',
    starRating: 4,
    rating: 4.4,
    reviewCount: 115,
    priceFrom: 5800,
    imageUrl: 'https://images.pexels.com/photos/14021097/pexels-photo-14021097.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Business', 'Modern', 'Garden View'],
    amenities: ['Free WiFi', 'Gym', 'Free Breakfast', 'Restaurant', 'Free Parking', 'Air Conditioning'],
  },
  {
    id: 'hotel-8',
    slug: 'howrah-heritage-stay',
    name: 'Howrah Heritage Stay',
    city: 'Kolkata',
    state: 'West Bengal',
    country: 'India',
    description: 'Classic Kolkata charm with modern comforts, close to Howrah Bridge and the riverfront. A nostalgic yet comfortable stay.',
    starRating: 3,
    rating: 4.5,
    reviewCount: 96,
    priceFrom: 3200,
    imageUrl: 'https://images.pexels.com/photos/39836720/pexels-photo-39836720.jpeg?auto=compress&cs=tinysrgb&w=1200',
    tags: ['Heritage', 'Riverside', 'Classic'],
    amenities: ['Free WiFi', 'Free Breakfast', 'Air Conditioning', 'Restaurant', '24h Front Desk'],
  },
];

export default function HomePage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setHotels(demoHotels);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const cities = useMemo(() => {
    const citySet = new Set(hotels.map((h) => h.city));
    return Array.from(citySet);
  }, [hotels]);

  const filteredHotels = useMemo(() => {
    let result = hotels;

    if (activeTab === 'saved') {
      result = result.filter((h) => favorites.includes(h.id));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          h.city.toLowerCase().includes(query) ||
          h.state.toLowerCase().includes(query)
      );
    }

    if (selectedCity) {
      result = result.filter((h) => h.city === selectedCity);
    }

    switch (sortBy) {
      case 'price_asc':
        result = [...result].sort((a, b) => a.priceFrom - b.priceFrom);
        break;
      case 'price_desc':
        result = [...result].sort((a, b) => b.priceFrom - a.priceFrom);
        break;
      case 'rating':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      default:
        result = result;
    }

    return result;
  }, [hotels, activeTab, favorites, searchQuery, selectedCity, sortBy]);

  const toggleFavorite = (hotelId: string) => {
    if (favorites.includes(hotelId)) {
      setFavorites((prev) => prev.filter((id) => id !== hotelId));
      setToast('Removed from favorites');
    } else {
      setFavorites((prev) => [...prev, hotelId]);
      setToast('Added to favorites');
    }
  };

  const getStarRating = (rating: number) => {
    const stars = Math.round(rating);
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            fill={star <= stars ? '#f59e0b' : 'none'}
            className={star <= stars ? 'text-[#f59e0b]' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f766e] text-white">
                <Sparkles size={20} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0f766e]">stayora</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-[#0f766e] transition-colors">
                Find a stay
              </Link>
              <Link href="#" className="text-sm font-medium text-gray-600 hover:text-[#0f766e] transition-colors">
                Inspiration
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-[#0f766e] transition-colors">
                My Hotels
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <button className="hidden sm:flex items-center gap-2 rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d5c5a] transition-colors">
                  Host Your Hotel
                </button>
              </Link>
              <button className="rounded-full p-2 hover:bg-gray-100">
                <Users size={20} className="text-gray-600" />
              </button>
              <button className="md:hidden rounded-full p-2 hover:bg-gray-100">
                <Menu size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#0f766e] pt-16 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white blur-3xl" />
          <div className="absolute top-1/2 -left-24 h-64 w-64 rounded-full bg-[#f59e0b] blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="animate-fade-in-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <Sparkles size={16} className="text-[#f59e0b]" />
                <span className="text-sm font-medium text-white">Curated stays for unforgettable experiences</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Find your perfect <br />
                <span className="text-[#f59e0b]">stay in India</span>
              </h1>
              <p className="mt-6 text-lg text-[#e0f2fe] max-w-lg">
                Discover handpicked hotels across India - from heritage havelis to beachfront resorts. Experience hospitality like never before.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 rounded-lg bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-white hover:bg-[#d97706] transition-colors"
                >
                  Explore Stays <ArrowRight size={18} />
                </button>
                <button className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
                  How It Works
                </button>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/39836720/pexels-photo-39836720.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Luxury hotel suite"
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f766e]/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white/90 p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#0f766e]" />
                        <span className="font-semibold">Popular Destinations</span>
                      </div>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {['Goa', 'Jaipur', 'Patna', 'Mumbai', 'Delhi'].map((city) => (
                          <span
                            key={city}
                            onClick={() => {
                              setSearchQuery(city);
                              document.getElementById('hotels')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="cursor-pointer rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0f766e] hover:bg-[#f59e0b] hover:text-white transition-colors"
                          >
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section id="hotels" className="py-16 bg-white border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Box */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by hotel name, city, or state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-4 text-gray-900 placeholder-gray-400 focus:border-[#0f766e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 transition-all"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative min-w-[200px]">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 focus:border-[#0f766e] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 transition-all"
                >
                  <option value="">All Locations</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>

              <div className="relative min-w-[180px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-gray-900 focus:border-[#0f766e] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20 transition-all"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-8 flex items-center gap-6 border-b border-gray-200 pb-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 text-sm font-semibold transition-colors ${
                activeTab === 'all' ? 'border-b-2 border-[#0f766e] text-[#0f766e]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Stays ({hotels.length})
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 text-sm font-semibold transition-colors ${
                activeTab === 'saved' ? 'border-b-2 border-[#0f766e] text-[#0f766e]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Saved for Later ({favorites.length})
            </button>
          </div>
        </div>
      </section>

      {/* Hotels Grid */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {activeTab === 'all' ? 'Our Top Picks' : 'Your Saved Stays'}
            </h2>
            <span className="text-gray-500">{filteredHotels.length} properties found</span>
          </div>

          {loading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[480px] animate-pulse rounded-2xl bg-white" />
              ))}
            </div>
          ) : filteredHotels.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-xl"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button
                      onClick={() => toggleFavorite(hotel.id)}
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white transition-all hover:bg-white hover:text-[#0f766e]"
                    >
                      <Heart
                        size={20}
                        fill={favorites.includes(hotel.id) ? '#ef4444' : 'none'}
                        className={favorites.includes(hotel.id) ? 'text-[#ef4444]' : ''}
                      />
                    </button>
                    <div className="absolute bottom-4 left-4">
                      <span className="rounded-full bg-[#f59e0b]/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        {hotel.starRating}★ Hotel
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#0f766e] transition-colors">
                          {hotel.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-1 text-gray-500">
                          <MapPin size={14} />
                          <span className="text-sm">{hotel.city}, {hotel.state}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1">
                        <Star size={14} fill="#f59e0b" className="text-[#f59e0b]" />
                        <span className="text-sm font-semibold">{hotel.rating}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {hotel.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <span className="text-xs text-gray-500 block">Starting from</span>
                        <span className="text-2xl font-bold text-[#0f766e]">{formatMoney(hotel.priceFrom)}</span>
                        <span className="text-sm text-gray-500"> / night</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedHotel(hotel)}
                          className="flex items-center gap-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => {
                            setSelectedHotel(hotel);
                            document.getElementById('room-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="flex items-center gap-1 rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d5c5a] transition-colors"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-6 rounded-full bg-gray-100 p-6">
                <Search size={48} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">No hotels found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('');
                  setSortBy('recommended');
                }}
                className="mt-6 rounded-lg bg-[#0f766e] px-6 py-2 text-sm font-semibold text-white hover:bg-[#0d5c5a]"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {filteredHotels.length > 0 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft size={20} />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0f766e] text-white">1</button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">2</button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">3</button>
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Why Choose Stayora?</h2>
            <p className="mt-4 text-lg text-gray-600">
              We believe that the right place can transform a trip from ordinary to extraordinary.
              Our curated selection ensures quality, comfort, and memorable experiences.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: 'Verified Quality',
                description: 'Every hotel is carefully selected based on guest reviews and our stringent quality standards.',
              },
              {
                icon: Sparkles,
                title: 'Unique Stays',
                description: 'From heritage properties to modern resorts, discover India\'s diverse accommodation options.',
              },
              {
                icon: Check,
                title: 'Best Price Guarantee',
                description: 'Book with confidence knowing you\'re getting the best possible rate for your stay.',
              },
            ].map((feature, index) => (
              <div key={index} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-[#0f766e]/5 transition-colors">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0f766e] text-white">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="bg-[#0f766e] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">Amenities for Every Need</h2>
              <p className="mt-4 text-lg text-[#c6f6d5]">
                Whether you're traveling for business or leisure, our hotels offer a wide range of amenities to make your stay comfortable and memorable.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {['Free High-Speed WiFi', 'Swimming Pools', 'Spa & Wellness', 'Fitness Centers', 'Restaurant Services', '24/7 Front Desk'].map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <Check size={18} className="text-[#f59e0b]" />
                    <span className="text-[#e0f2fe]">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img src="https://images.pexels.com/photos/8134808/pexels-photo-8134808.jpeg?auto=compress&cs=tinysrgb&w=400" className="rounded-2xl object-cover h-48 w-full" alt="Pool" />
                <img src="https://images.pexels.com/photos/39836720/pexels-photo-39836720.jpeg?auto=compress&cs=tinysrgb&w=400" className="rounded-2xl object-cover h-48 w-full mt-8" alt="Room" />
                <img src="https://images.pexels.com/photos/14021097/pexels-photo-14021097.jpeg?auto=compress&cs=tinysrgb&w=400" className="rounded-2xl object-cover h-48 w-full" alt="Restaurant" />
                <img src="https://images.pexels.com/photos/34645081/pexels-photo-34645081.jpeg?auto=compress&cs=tinysrgb&w=400" className="rounded-2xl object-cover h-48 w-full mt-8" alt="Spa" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f766e] text-white">
                  <Sparkles size={16} strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold text-white">stayora</span>
              </div>
              <p className="text-sm text-gray-400">
                Curated stays for unforgettable experiences across India.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Explore</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#0f766e] transition-colors">Destinations</a></li>
                <li><a href="#" className="hover:text-[#0f766e] transition-colors">Hotels</a></li>
                <li><a href="#" className="hover:text-[#0f766e] transition-colors">Experiences</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#0f766e] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#0f766e] transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-[#0f766e] transition-colors">Cancellation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Newsletter</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white focus:border-[#0f766e] focus:outline-none"
                />
                <button className="rounded-lg bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d5c5a]">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2026 Stayora. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Hotel Details Modal */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <button
              onClick={() => setSelectedHotel(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-600 hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="relative h-64 md:h-80">
              <img src={selectedHotel.imageUrl} alt={selectedHotel.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-[#f59e0b] px-3 py-1 text-xs font-semibold text-white">
                    {selectedHotel.starRating}★ Hotel
                  </span>
                  <span className="flex items-center gap-1 text-white/90">
                    <Star size={14} fill="#f59e0b" className="text-[#f59e0b]" />
                    {selectedHotel.rating} ({selectedHotel.reviewCount} reviews)
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">{selectedHotel.name}</h2>
                <div className="mt-1 flex items-center gap-2 text-white/80">
                  <MapPin size={18} />
                  <span>{selectedHotel.city}, {selectedHotel.state}</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">About this hotel</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{selectedHotel.description}</p>

                  <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedHotel.amenities.map((amenity) => (
                      <div key={amenity} className="flex items-center gap-2 text-sm text-gray-600">
                        <Check size={16} className="text-[#0f766e]" />
                        {amenity}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 p-6 rounded-2xl bg-[#0f766e]/5 border border-[#0f766e]/20">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f766e] text-white shrink-0">
                        <ShieldCheck size={24} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Book with Confidence</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Free cancellation before {new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          . Secure payment. 24/7 customer support.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-1">
                  <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="text-right mb-4">
                      <span className="text-3xl font-bold text-[#0f766e]">{formatMoney(selectedHotel.priceFrom)}</span>
                      <span className="text-gray-500 ml-1"> / night</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedHotel(null);
                        // Navigate to booking flow
                      }}
                      className="w-full rounded-xl bg-[#0f766e] py-3 font-semibold text-white hover:bg-[#0d5c5a] mb-4 transition-colors"
                    >
                      Book Now
                    </button>
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2 justify-center">
                        <ShieldCheck size={16} className="text-green-500" />
                        <span>Free cancellation</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <Check size={16} className="text-green-500" />
                        <span>No credit card required</span>
                      </div>
                      <div className="flex items-center gap-2 justify-center">
                        <Sparkles size={16} className="text-[#f59e0b]" />
                        <span>Instant confirmation</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-in rounded-xl bg-[#0f766e] px-6 py-3 text-white shadow-xl flex items-center gap-3">
          <Check size={20} />
          <span className="font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
