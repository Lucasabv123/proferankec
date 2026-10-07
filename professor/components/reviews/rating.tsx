import Rating from "react-rating";

interface StarRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange }) => 
{   
    const RatingComponent = Rating as any; 
    return (
        // larger stars so each one is easy to tap on a phone
        <span className="text-2xl">
        <RatingComponent
            initialRating={rating}
            emptySymbol="far fa-star"
            fullSymbol="fas fa-star"
            fractions={2}
            onChange={onRatingChange}
        />
        </span>
    );

}

export default StarRating;