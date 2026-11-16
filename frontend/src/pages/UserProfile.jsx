import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { User, LogOut, Check, Lock, Eye, Calendar, Clock, MapPin, Film } from 'lucide-react';
import { logoutUser, updateUser } from '../apis/user.apis.js';
import { useAuth } from '../context/AuthContext.jsx';
import { bookingDetails, myBookings } from '../apis/booking.api.js';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Bookings state from API
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Detailed booking modal state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Account details & Password states
  const [userInfo, setUserInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch bookings on mount or page change
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        setIsLoadingBookings(true);
        const response = await myBookings(); // Hits GET /bookings
        if (response?.success) {
          setBookings(response.data.bookings);
          setTotalPages(response.data.totalPages);
          setCurrentPage(response.data.currentPage);
        }
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        toast.error('Failed to load booking history.');
      } finally {
        setIsLoadingBookings(false);
      }
    };

    fetchUserBookings();
  }, []);

  // Handle viewing specific booking details
  const handleViewDetails = async (bookingId) => {
    try {
      setIsLoadingDetails(true);
      const response = await bookingDetails(bookingId); 
      if (response?.success) {
        setSelectedTicket(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch booking details:', error);
      toast.error('Could not fetch ticket details.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSignOut = async (e) => {
    e.preventDefault();
    const loadingToast = toast.id = toast.loading('Signing out...');
    try {
      await logoutUser();
      toast.success('Signed out successfully!', { id: loadingToast });
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logged out with warnings.', { id: loadingToast });
    } finally {
      setUser(null);
      navigate('/');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwords.newPassword || passwords.confirmPassword) {
      if (passwords.newPassword.length < 6) {
        const errMsg = 'New password must be at least 6 characters long.';
        setPasswordError(errMsg);
        toast.error(errMsg);
        return;
      }
      if (passwords.newPassword !== passwords.confirmPassword) {
        const errMsg = 'New passwords do not match.';
        setPasswordError(errMsg);
        toast.error(errMsg);
        return;
      }
    }

    try {
      setIsUpdating(true);
      const data = await updateUser({
        name: userInfo.name,
        password: passwords.newPassword || undefined,
      });

      setUser((prevUser) => ({
        ...prevUser,
        ...(data?.user || { name: userInfo.name }),
      }));

      setPasswords({ newPassword: '', confirmPassword: '' });
      toast.success('Profile updated successfully!');
    } catch (error) {
      const errMsg = error.message || 'Failed to update profile. Please try again.';
      setPasswordError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Profile Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-rose-600/20 shrink-0">
              {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{userInfo.name}</h1>
              <p className="text-xs text-slate-500 font-medium">{userInfo.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 text-xs font-semibold rounded-xl transition-all duration-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 cursor-pointer shadow-sm active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'bookings' ? 'border-rose-600 text-rose-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 transition-colors cursor-pointer border-b-2 ${
              activeTab === 'settings' ? 'border-rose-600 text-rose-600' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Account Settings
          </button>
        </div>

        {/* Tab 1: Bookings Listing */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Booking History</h2>
              <span className="text-xs text-slate-500 font-medium">Total Bookings: {bookings.length}</span>
            </div>

            {isLoadingBookings ? (
              <div className="text-center py-12 text-xs text-slate-400 font-medium">Loading your bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-500">
                You haven't booked any movie tickets yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((booking) => {
                  const show = booking.showId || {};
                  const movie = show.movieId || {}; 
                  const screenName = show.screenId?.name || 'Screen 1';

                  return (
                    <div key={booking._id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4 flex flex-col justify-between">
                      <div className="flex gap-4">
                        <img 
                          src={movie.poster || booking.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80'} 
                          alt={movie.title || booking.movieTitle || 'Movie Poster'} 
                          className="w-20 aspect-[2/3] object-cover rounded-xl border border-slate-100 shrink-0" 
                        />
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                              booking.status === 'Upcoming' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {booking.status || 'Confirmed'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">#{booking._id.slice(-6).toUpperCase()}</span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 truncate">{movie.title || booking.movieTitle || 'Movie Ticket'}</h3>
                          <p className="text-xs text-slate-500">{screenName} • {show.format || booking.format || 'Standard'}</p>
                          <p className="text-xs font-semibold text-slate-800">
                            {show.date ? new Date(show.date).toLocaleDateString() : booking.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">SEATS</span>
                          <span className="text-xs font-bold text-slate-800">{booking.seatNumber ? booking.seats.join(', ') : 'N/A'}</span>
                        </div>

                        <button
                          onClick={() => handleViewDetails(booking._id)}
                          disabled={isLoadingDetails}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all cursor-pointer shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Account Settings Form */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900">Personal & Security Settings</h2>
              <p className="text-xs text-slate-500">Update your profile name or change your account password.</p>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1 opacity-70">
                <label className="text-xs font-bold text-slate-700">Email Address (Locked)</label>
                <input
                  type="email"
                  value={userInfo.email}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <hr className="border-slate-100 my-4" />

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Change Password</h3>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
                    />
                  </div>
                </div>

                {passwordError && (
                  <p className="text-xs font-medium text-rose-600">{passwordError}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedTicket && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setSelectedTicket(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-1 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Booking #{selectedTicket._id}</span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedTicket.showId?.movieId?.title || selectedTicket.movieTitle || 'Booking Summary'}
                </h3>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs text-slate-700">
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Screen</span>
                  <span className="font-bold">{selectedTicket.showId?.screenId?.name || 'Screen 1'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Seats</span>
                  <span className="font-bold">{selectedTicket.seats?.join(', ')}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Total Amount</span>
                  <span className="font-bold text-rose-600">₹{selectedTicket.totalAmount || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold text-emerald-600">{selectedTicket.status || 'Confirmed'}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}