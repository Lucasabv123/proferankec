"use client";
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 

interface HomeButtonProps {
    size?: number; 
    width?: number; 
    height?: number;
    disabled?: boolean;
}


const HomeButton: React.FC<HomeButtonProps> = ({size=50 , width, height, disabled = false}) => {
    const router = useRouter();

    const handleClick = (): void => {
        if (disabled) return;
        router.push('/'); 
    };

    return (
        <div>
            <button className="home-button" disabled={disabled} onClick={handleClick}>
                <Image src = "/professor-rank-logo.png" alt="Home" width={width || size} height={height || size} /> 
            </button>
            
            
        </div>
    );
};

export default HomeButton;
