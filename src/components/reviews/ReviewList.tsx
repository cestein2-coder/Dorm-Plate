import React, { useState, useEffect } from 'react';
import { Star, User, ThumbsUp, MessageCircle } from 'lucide-react';
import { reviewHelpers } from '../../lib/mvp-supabase';
import type { Review } from '../../lib/mvp-types';

interface ReviewListProps {
  restaurantId: string;
  showAddReview?: boolean;
  onAddReview?: () => void;
}

const ReviewList: React.FC<ReviewListProps> = ({ 
  restaurantId, 
  showAddReview = false, 
  onAddReview 
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, [restaurantId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await reviewHelpers.getRestaurantReviews(restaurantId);
      
      if (error) throw error;
      
      setReviews(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="text-food-orange mb-2">Error loading reviews</div>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={loadReviews}
            className="text-food-orange hover:text-food-orange-dark font-medium text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const averageRating = getAverageRating();
  const distribution = getRatingDistribution();

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Reviews Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Reviews ({reviews.length})
          </h2>
          {showAddReview && onAddReview && (
            <button
              onClick={onAddReview}
              className="bg-food-orange text-white px-4 py-2 rounded-lg font-medium hover:bg-food-orange-dark transition-colors flex items-center"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Write Review
            </button>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(averageRating)} size="md" />
              <p className="text-sm text-gray-600 mt-2">
                Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 w-8">
                    {rating}★
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${reviews.length > 0 ? (distribution[rating as keyof typeof distribution] / reviews.length) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8">
                    {distribution[rating as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="divide-y divide-gray-100">
        {reviews.length === 0 ? (
          <div className="p-8 text-center">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your experience with this restaurant!
            </p>
            {showAddReview && onAddReview && (
              <button
                onClick={onAddReview}
                className="bg-food-orange text-white px-6 py-2 rounded-lg font-medium hover:bg-food-orange-dark transition-colors"
              >
                Write First Review
              </button>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-6">
              <div className="flex items-start space-x-4">
                {/* Avatar */}
                <div className="w-10 h-10 bg-food-brown-light rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-food-brown" />
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {review.user_profile?.first_name} {review.user_profile?.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {review.user_profile?.university}
                      </p>
                    </div>
                    <div className="text-right">
                      <StarRating rating={review.rating} />
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Review Text */}
                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed mb-3">
                      {review.comment}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">Helpful</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList;




