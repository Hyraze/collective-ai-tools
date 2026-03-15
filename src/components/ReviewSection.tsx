import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Review {
  _id: string;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewSectionProps {
  targetId: string;
  targetType: 'mcp' | 'tool';
}

export default function ReviewSection({ targetId, targetType }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [targetId]);

  async function fetchReviews() {
    try {
      const res = await fetch(`/api/reviews/${targetId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId,
          targetType,
          rating,
          comment
        })
      });

      if (res.ok) {
        setRating(0);
        setComment('');
        fetchReviews(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to post review', error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
        <MessageSquare className="h-5 w-5" />
        Reviews & Ratings
      </h3>

      {/* Write Review */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rate this tool</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 rounded-md transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-200'}`}
                >
                  <Star className="h-6 w-6 fill-current" />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Share your experience..."
            />
          </div>
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
            Post Review
          </button>
        </form>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
            <p className="text-blue-800 dark:text-blue-200 mb-2">Sign in to leave a review</p>
            <Link to="/login" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                Log In
            </Link>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-4">
        {loading ? (
             <div className="text-center py-4 text-gray-500">Loading reviews...</div>
        ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                No reviews yet. Be the first to review!
            </div>
        ) : (
            reviews.map((review) => (
                <div key={review._id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {review.user?.avatar ? (
                                <img src={review.user.avatar} alt={review.user.name} className="w-8 h-8 rounded-full" />
                            ) : (
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-500" />
                                </div>
                            )}
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{review.user?.name || 'Unknown User'}</p>
                                <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
