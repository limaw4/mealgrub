import Center from "@/components/Center";
import Header from "@/components/Header";
import { mongooseConnect } from "@/lib/mongoose";
import mongoose from "mongoose";
import { Recipe } from "@/models/Recipe";
import CategorySchema from "@/models/Category";
import styled from "styled-components";
import { BagContext } from "@/components/BagContext";
import { Link as ScrollLink, animateScroll as scroll } from 'react-scroll';
import Footer from "@/components/Footer";
import { useContext, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import YouTube from 'react-youtube';
import jsPDF from "jspdf";
import ScrollToTopButton from "@/components/ScrollToTop";
import Fraction from 'fraction.js';
import { format } from 'date-fns';
import StarRatings from "react-star-ratings";
import { useEffect } from "react";
import axios from "axios";
import { toast } from 'react-hot-toast';
import { useSession } from "next-auth/react";
import SideWindow from "@/components/SideWindow";
import { useSpeechSynthesis } from 'react-speech-kit';
import { useRef } from "react";
import "@/components/fonts/Poppins-Light-normal"
import "@/components/fonts/Poppins-Medium-normal"
import "@/components/fonts/OpenSans_Condensed-Regular-normal"
import "@/components/fonts/Inter-Regular-normal"
import "@/components/fonts/Inter-Bold-normal"
import "@/components/fonts/RobotoSlab-Medium-bold"

const PageWrapper = styled.div`
    background-color: #eee;
`;

const IconButtons = styled.div`
  width: 40px;
  height: 40px;
  position: fixed;
  top: ${(props) => (props.isSideWindowOpen ? "300px" : "300px")};
  right: ${(props) => (props.isSideWindowOpen ? "405px" : "55px")};
  z-index: 999;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: top 0.5s, right 0.5s;
  @media screen and (max-width: 768px) {
    top: ${(props) => (props.isSideWindowOpen ? "300px" : "500px")};
    right: ${(props) => (props.isSideWindowOpen ? "405px" : "15px")};
  }
`;

const BagLength = styled.span`
  font-size: 10px;
  position: absolute;
  height: 8px;
  width: 8px;
  top: -5px;
  right: -5px;
  background-color: #FF0126;
  color: #fff;
  padding: 5px;
  border-radius: 50%;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Icon = styled.svg`
  width: 16px;
  height: 16px;
`;

const Title = styled.h1`
    font-size: 3em;
    font-weight: bold;
    margin: 18px 0;
    @media screen and (max-width: 768px) {
        font-size: 2em;
        margin: 12px 0;
    }
`;

const Description = styled.p`
    font-size: 1.2em;
    font-weight: normal;
    text-align: justify;
    margin: 12px 0;
    @media screen and (max-width: 768px) {
        font-size: 0.8em;
    }
`;

const Message = styled.p`
    color: #ff3333;
    font-size: 12px;
    @media screen and (max-width: 768px) {
        font-size: 8px;
    }
`;

const CategoryWrapper = styled.div`
    color: #666;
    margin: 0;
    font-size: 12px;
    a {
        color: #666;
        text-decoration: none;
        &:hover {
            color: #111;
            transition: all .3s ease;
        }
    }
`;

const VideoContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    text-align: center;
    margin-top: 20px;

    &:before {
        content: '';
        display: block;
        height: 80px;
        margin-top: -80px;
        visibility: hidden;
    }

    @media screen and (max-width: 768px) {
        iframe {
            height: 200px !important;
        }
    }
`;

const FeedbackContainer = styled.div`
    margin-bottom: 100px;
    @media screen and (max-width: 768px) {
        margin-top: -70px;
        margin-bottom: 50px;
    }
`;

const Feedback = styled.div`
    margin-top: 100px;
    background-color: #F7F7F7;
    padding: 4px 12px 12px 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 65%;
    border-radius: 8px;
    h2 {
        font-size: 24px;
        margin-bottom: 0;
    }
    p {
        margin-top: 4px;
    }
    button {
        margin-top: 10px;
        background: #333;
        color: #fff;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        text-align: center;
        align-items: center;
        font-size: 16px;
        cursor: pointer;
    }

    @media screen and (max-width: 768px) {
        width: 94%;
        h2 {
            font-size: 18px;
        }
        p {
            margin-top: 4px;
            font-size: 12px;
        }
        button {
            font-size: 12px;
            padding: 8px 12px;
        }
    
    }
`;

const CommentBox = styled.div`
    display: flex;
    flex-direction: column;
    h2 {
      margin-bottom: 0;
    }
    p {
        font-size: 16px;
        margin-bottom: 0;
    }
    @media screen and (max-width: 768px) {
        h2 {
            font-size: 16px;
            margin: 30px 0 0 0;
        }
    }
`;

const Comment = styled.div`
    display: flex;
    flex-direction: column;
    border-bottom: 4px solid #ddd;
    span {
        font-size: 18px;
        margin-bottom: 10px;
    }
    @media screen and (max-width: 768px) {
        span {
            font-size: 12px;
            margin-bottom: 10px;
        }
    }
`;

const FullName = styled.h4`
  font-size: 20px;
  font-weight: 500;
  margin-bottom: 0;
  @media screen and (max-width: 768px) {
    font-size: 16px;
  }
`;

const PostedDate = styled.h1`
  font-weight: 500;
  margin-bottom: 6px;
  font-size: 12px;
  @media screen and (max-width: 768px) {
    font-size: 10px;
    margin-bottom: 2px;
  }
`;

const CommentContainer = styled.div`
    display: flex;
    flex-direction: column;
    p {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 0;
    }
    textarea {
        height: 180px;
        resize: none;
        border: 1px solid #777;
        border-radius: 4px;
        padding: 12px;
    }
    @media screen and (max-width: 768px) {
        p {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 0;
        }
        textarea {
            height: 180px;
            resize: none;
            border: 1px solid #777;
            border-radius: 4px;
            padding: 4px;
        }    
    }
`;

const Label = styled.h2`
    font-size: 1.8rem;
    font-weight: normal;
    margin: 0;
    @media screen and (max-width: 768px) {
        font-size: 1.6rem;
    }
`;


const Info = styled.div`
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    margin: 0 0 20px 0;
    gap: 0;
    p{
        font-size: 14px;
        margin: 0;
        font-weight: bold;
        font-style: italic;
    }
    a{
        font-size: 14px;
        margin: 0;
    }
    span{
        align-items: center;
        font-weight: 500;
    }
    svg{
        height: 18px;
        width: 18px;
    }
    @media screen and (max-width: 768px) {
        margin-bottom: 10px;
        p{
            font-size: 10px;
        }
        span{
            font-size: 10px;
        }
        svg{
            height: 14px;
            width: 14px;
        }
        a{
            font-size: 10px;
        }
    }

`;

const Cooking = styled.div`
    display: flex;
    gap: 2px;
    align-items: center;
    font-weight: normal;
    font-style: normal;
    margin-bottom: 12px;
`;

const TextLabel = styled.h2`
    font-size: 1rem;
    font-weight: bold;
    margin: 0;
    text-align: center;
    @media screen and (max-width: 768px) {
    }
`;

const List = styled.ul`
    list-style: none;
    padding: 0;
`;

const ListItem = styled.li`
    display: grid;
    margin-bottom: 8px;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #ccc;
    grid-template-columns: 1fr 1fr;
    column-gap: 40px;
    &:last-child {
        border-bottom: none;
    }
`;

const Name = styled.span`
    font-size: 14px;
    @media screen and (max-width: 768px) {
        font-size: 10px;
    }
`;

const ProcedureContainer = styled.div`
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    position: relative;
`;

const SpeechButton = styled.button`
    border: 1px solid #ccc;
    display: flex;
    gap: 2px;
    justify-content: center;
    align-content: center;
    align-items: center;
    padding: 4px 6px;
    background-color: #fff;
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
    svg {
        height: 18px;
        width: 18px;
    }
    p {
        margin: 0;
        font-weight: 500;
    }
`;

const ProcedureStep = styled.div`
    margin-top: 10px;
    margin: 0 10px;
    display: flex;
    gap: 10px;
    @media screen and (max-width: 768px) {
        flex-direction: column;
        gap: 0;
        margin: 0px;
    }
`;

const Step = styled.p`
    font-weight: bold;
    flex: 1;
    font-style: italic;
    @media screen and (max-width: 768px) {
        margin-bottom: 4px;
    }
`;

const Steps = styled.p`
    font-weight: normal;
    text-align: justify;
    flex: 8;
    @media screen and (max-width: 768px) {
        margin: 0px;
    }
`;


const IngredientsContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-top: 10px;
    background-color: #f7f7f7;
    padding: 16px 16px 2px 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NutritionalValuesContainer = styled.div`
    margin-top: 20px;
    margin-top: 20px;
    background-color: #f7f7f7;
    padding: 16px 16px 2px 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ServingsControls = styled.div`
    display: flex;
    margin: 12px 0;
    justify-content: space-between;
`;

const ServingsButton = styled.button`
    display: flex; 
    background-color: #555;
    color: #fff;
    align-items: center;
    padding: 2px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s ease;

    svg {
        width: 14px;
        height: 14px;
    }

    &:hover {
        background-color: #111;
    }

    @media screen and (max-width: 768px) {\
        height: 12px;
        width: 12px;
        svg {
            width: 8px;
            height: 8px;
        }
    }
`;

const ServingsLabel = styled.p`
    font-size: 14px;
    margin: 0px 16px 0px 0px;
    color: #333;
    @media screen and (max-width: 768px) {
        font-size: 10px;
    }
`;

const SetContainer = styled.div`
    display: flex;
    gap: 10px;
`;

const SetLabel = styled.p`
    font-size: 14px;
    margin: 0px;
    color: #333;
    @media screen and (max-width: 768px) {
        font-size: 10px;
    }
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  background-color: #444;
  font-size: 1rem;
  color: #fff;
  padding: 4px 12px;
  text-align: center;
  border: none;
  cursor: pointer;
  transition: all 0.4s;

  svg {
    width: 18px;
    height: 18px;
    margin-right: 4px;
  }

  &:hover {
    background-color: #111;
  }
`;

const CopyButtonWrapper = styled.div`
    display: flex;
    justify-content: flex-end;
`;

const ColumnWrapper = styled.div`
  display: flex;
  margin: 20px 0;
  @media screen and (max-width: 768px) {
    flex-direction: column;
    margin: 0;
  }
`;

const LeftColumn = styled.div`
  flex: 2;
  padding: 16px 16px 0 0 ;
`;

const RightColumn = styled.div`
  flex: 1;
  padding: 16px 0px;
`;

const RecipeImageContainer = styled.div`
  position: relative;
`;

const RecipeImage = styled.div`
  height: 400px;
  width: 100%;
  background-color: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  img {
    height: 100%;
    width: auto;
    max-width: 100%;
  }

  @media screen and (max-width: 768px) {
    height: 200px;
  }
`;



const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 20px;
  color: #333;
  background: none;
  border: none;
  cursor: pointer;
`;

const PreviousButton = styled(NavigationButton)`
  left: 20px;
  height: 40px;
  width: 40px;
  color: #fff;
  background-color: #333;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.1s ease, left 0.3s ease; /* Combine transitions */
  svg {
    height: 24px;
    width: 24px;
  }
  &:hover {
    background-color: #111;
    left: 18px;
  }

  @media screen and (max-width: 768px) {
    left: 10px;
    height: 30px;
    width: 30px;
    svg {
        height: 18px;
        width: 18px;
    }
  }
`;

const NextButton = styled(NavigationButton)`
  right: 20px;
  height: 40px;
  width: 40px;
  color: #fff;
  background-color: #333;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.1s ease, right 0.1s ease; /* Combine transitions */
  svg {
    height: 24px;
    width: 24px;
  }
  &:hover {
    background-color: #111;
    right: 18px;
  }

  @media screen and (max-width: 768px) {
    right: 10px;
    height: 30px;
    width: 30px;
    svg {
        height: 18px;
        width: 18px;
    }
  }
`;

const RatingsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
  @media screen and (max-width: 768px) {
    margin-top: 4px;
    gap: 8px;
  }
`;

const AverageRating = styled.p`
  font-size: 24px;
  margin: 0 0 0px 8px;
  @media screen and (max-width: 768px) {
    margin: 0;
    font-size: 16px;
  }
`;

const Buttons = styled.div`
  margin: 0;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  button {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    width: 80px;
    font-size: 14px;
    padding: 4px;
    border-radius: 4px;
    border: solid .8px #ccc;
    cursor: pointer;
    background-color: #F7F7F7;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    svg {
        height: 18px;
        width: 18px;
    }
    @media screen and (max-width: 768px) {
        margin: 10px 0;
    }
}
`;

const ServingsInput = styled.input`
    width: 40px;
    height: 14px;
`;

const PreviousIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
    </svg>
);
  
const NextIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
    </svg>
);

export default function RecipePage({ recipe }) {
    const { addRecipe } = useContext(BagContext);
    const categoryArray = Array.isArray(recipe.category) ? recipe.category : [recipe.category];
    const [sets, setSets] = useState(1);
    const [servings, setServings] = useState(recipe.servings);
    const originalServings = recipe.servings;
    const originalIngredients = recipe.ingredients;
    const [servingsChanged, setServingsChanged] = useState(false);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const formattedCreatedAt = format(new Date(recipe.createdAt), 'MMMM dd, yyyy HH:mm:ss');
    const formattedUpdatedAt = format(new Date(recipe.updatedAt), 'MMMM dd, yyyy');
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [userRating, setUserRating] = useState(averageRating);
    const { data: session } = useSession();
    const [comments, setComments] = useState([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [isSideWindowOpen, setIsSideWindowOpen] = useState(false);
    const { bagRecipes } = useContext(BagContext);
    const [starDimension, setStarDimension] = useState("30px");
    const [starSpacing, setStarSpacing] = useState("4px");
    const { speak, speaking, supported } = useSpeechSynthesis();
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        const updateStarDimension = () => {
          setStarDimension(window.innerWidth < 768 ? "20px" : "30px");
          setStarSpacing(window.innerWidth < 768 ? "2px" : "4px");
        };
    
        updateStarDimension();
        window.addEventListener("resize", updateStarDimension);
    
        return () => {
          window.removeEventListener("resize", updateStarDimension);
        };
    }, []);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(`/api/comment?recipeId=${recipe._id}`);
                setComments(response.data.comments);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        fetchComments();
    }, [recipe._id]);

    const handleAddComment = async () => {
        const userId = session.user._id;
        const recipeId = recipe._id;
      
        if (newCommentText.trim() !== '') {
          try {
            const response = await fetch('/api/comment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                recipeId,
                userId,
                text: newCommentText,
                approved: false,
              }),
            });
      
            if (response.ok) {
              const data = await response.json();
              setComments([...comments, data.comment]);
              setNewCommentText('');
      
              toast.success("Thank you for submitting your comment. Wait for admin's approval.", {
                position: 'bottom-left',
              });
      
            } else {
              console.error('Failed to add comment:', response.statusText);
            }
          } catch (error) {
            console.error('Error adding comment:', error);
          }
        }
    };
    
    useEffect(() => {
      axios
        .get(`/api/getRecipeRatings?recipeId=${recipe._id}`)
        .then((response) => {
          const { average, total } = response.data;
          setAverageRating(average);
          setTotalRatings(total);
          setUserRating(average);
        })
        .catch((error) => {
          console.error('Error fetching recipe ratings:', error);
        });
    }, [recipe._id]);
  
    const toggleSideWindow = () => {
        setIsSideWindowOpen(!isSideWindowOpen);
      };
    
      const mainContentStyle = {
        marginRight: isSideWindowOpen ? '400px' : '0',
        transition: 'margin-right 0.5s',
    };

    const handleRatingChange = (newRating) => {
      if (!session || !session.user || !session.user._id) {
        console.log('Unauthenticated');
        return;
      }
  
      setUserRating(newRating);
  
      axios
        .post(
          '/api/rateRecipes',
          { userId: session.user._id, recipeId: recipe._id, value: newRating },
          { withCredentials: true }
        )
        .then((response) => {
  
          axios
            .get(`/api/getRecipeRatings?recipeId=${recipe._id}`)
            .then((response) => {
              const { average, total } = response.data;
              setAverageRating(average);
              setTotalRatings(total);
            })
            .catch((error) => {
              console.error('Error fetching recipe ratings:', error);
            });
        })
        .catch((error) => {
          console.error('Error rating recipe:', error);
        });
    };

    const handlePrevImage = () => {
        setActiveImageIndex((prevIndex) => (prevIndex - 1 + recipe.images.length) % recipe.images.length);
    };

    const handleNextImage = () => {
        setActiveImageIndex((prevIndex) => (prevIndex + 1) % recipe.images.length);
    };

    const procedureStepsText = recipe.procedure.map((step, index) => `${step}`);

    const speakProcedure = () => {
        const textToSpeak = procedureStepsText.map((step, index) => `Step ${index + 1}: ${step}`).join(' ');
    
        if (!isSpeaking) {
            speak({ text: textToSpeak });
            setIsSpeaking(true);
        } else {
            stopSpeaking();
        }
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    };

    useEffect(() => {
        return () => {
            stopSpeaking(); 
        };
    }, []);

    const generatePDF = () => {
        const doc = new jsPDF();
        const today = new Date();
    
        doc.setFont('Poppins-Medium', 'normal');
    
        doc.setFontSize(18);
    
        const recipeLink = `${window.location.origin}/recipe/${recipe._id}`;
        const originLink = window.location.origin;
        doc.setTextColor(86, 130, 3);
        doc.textWithLink("MealGrub", 10, 10, { url: originLink });
    
        doc.setFontSize(16);
    
        doc.setFont('Inter-Regular', 'normal');
        doc.setTextColor(17, 17, 17);
        doc.setFontSize(10);
        doc.text("Title:", 10, 20);
        doc.text("Servings:", 10, 25);
        doc.setFont('Inter-Bold', 'normal');
    
        doc.textWithLink(recipe.title, 19, 20, { url: recipeLink });
    
        doc.text(`${servings}`, 26, 25);
    
        doc.setFont('Inter-Regular', 'normal');
        doc.text("Date:", 161, 20);
    
        doc.setFont('Inter-Bold', 'normal');
        doc.text(today.toDateString(), 171, 20);
    
        doc.setFontSize(10);
        doc.setTextColor(64, 64, 64);
    
        doc.setFont('RobotoSlab-Medium', 'bold');
    
        doc.text("Ingredients:", 10, 35); 
    
        const separatorY = 38; 
        doc.line(10, separatorY, 200, separatorY);
    
        let yPos = 44;
    
        updatedIngredients.forEach((ingredient) => {
            doc.text(`${ingredient.quantity} ${ingredient.measurement} - ${ingredient.name}`, 10, yPos);
            yPos += 5;
        });
    
        yPos += 10;
        doc.text("Procedures:", 10, yPos);
    
        yPos += 3;
        doc.line(10, yPos, 200, yPos);
    
        yPos += 6;
    
        procedureStepsText.forEach((step, index) => {
        doc.setTextColor(0, 0, 0);

        const stepNumber = `Step ${index + 1}:`;
        doc.text(stepNumber, 10, yPos);

        doc.setTextColor(64, 64, 64);

        const lines = doc.splitTextToSize(step, 190);

        const spaceNeeded = (lines.length + 1) * 6; 
        if (yPos + spaceNeeded > 290) {
            doc.addPage();
            yPos = 10;
        }

        lines.forEach((line, lineIndex) => {
            doc.text(line, 10, yPos + 6 * (lineIndex + 1)); 
        });

        yPos += spaceNeeded;
        });

        const pdfFileName = `MealGrub-${recipe.title}_Ingredients_${new Date().getTime()}.pdf`;
        doc.save(pdfFileName);
    };
      
    const increaseSets = () => {
        setSets(sets + 1);
        const newServings = originalServings * (sets + 1);
        setServings(newServings);
        setServingsChanged(newServings !== originalServings);
      };
    
      const decreaseSets = () => {
        if (sets > 1) {
          setSets(sets - 1);
          const newServings = originalServings * (sets - 1);
          setServings(newServings);
          setServingsChanged(newServings !== originalServings);
        }
      };

    const servingsRatio = servings / originalServings;
    const updatedIngredients = originalIngredients.map((ingredient, index) => {    
        return {
            name: ingredient.name,
            quantity: new Fraction(ingredient.quantity.trim()).mul(servingsRatio).toFraction(true),
            measurement: ingredient.measurement,
        };
    });     

    const nutriValueList = recipe.nutriValue.map((nutriItem, index) => (
        <ListItem key={index}>
            <span>{nutriItem.name}</span>
            <span>{nutriItem.value}</span>
        </ListItem>
    ));

    const procedureSteps = recipe.procedure.map((step, index) => (
        <ProcedureStep key={index}>
          <Step>{`Step ${index + 1} `}</Step>
          <Steps>{step}</Steps>
        </ProcedureStep>
    ));

    return (
        <div style={mainContentStyle}>
            <PageWrapper>
                <Header />
                <Center>
                    <div>
                        <ColumnWrapper>
                            <LeftColumn>
                                <CategoryWrapper>
                                    {categoryArray.map((cat, index) => (
                                        <span key={cat._id}>
                                            {index > 0 && ', '}
                                            <Link href="/category/[categoryId]" as={`/category/${cat._id}`}>
                                                {cat.name}
                                            </Link>
                                        </span>
                                    ))}
                                </CategoryWrapper>
                                <Title>{recipe.title}</Title>
                                <RatingsWrapper>
                                    <StarRatings
                                        rating={userRating}
                                        starRatedColor="#FFC13B"
                                        changeRating={handleRatingChange}
                                        numberOfStars={5}
                                        name="userRating"
                                        starDimension={starDimension}
                                        starSpacing={starSpacing}
                                    />
                                    <AverageRating>
                                     {parseFloat(averageRating).toFixed(1)} out of {totalRatings} votes
                                    </AverageRating>          
                                </RatingsWrapper>
                                <Buttons>
                                    <button onClick={() => addRecipe(recipe._id)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                            <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                                        </svg>
                                        Save
                                    </button>
                                    <ScrollLink to="videoContainer" smooth={true}>
                                        <button>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                <path d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3H4.5ZM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06Z" />
                                            </svg>
                                            Video
                                        </button>
                                    </ScrollLink>
                                    <button onClick={() => generatePDF(procedureStepsText)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                            <path fillRule="evenodd" d="M7.875 1.5C6.839 1.5 6 2.34 6 3.375v2.99c-.426.053-.851.11-1.274.174-1.454.218-2.476 1.483-2.476 2.917v6.294a3 3 0 0 0 3 3h.27l-.155 1.705A1.875 1.875 0 0 0 7.232 22.5h9.536a1.875 1.875 0 0 0 1.867-2.045l-.155-1.705h.27a3 3 0 0 0 3-3V9.456c0-1.434-1.022-2.7-2.476-2.917A48.716 48.716 0 0 0 18 6.366V3.375c0-1.036-.84-1.875-1.875-1.875h-8.25ZM16.5 6.205v-2.83A.375.375 0 0 0 16.125 3h-8.25a.375.375 0 0 0-.375.375v2.83a49.353 49.353 0 0 1 9 0Zm-.217 8.265c.178.018.317.16.333.337l.526 5.784a.375.375 0 0 1-.374.409H7.232a.375.375 0 0 1-.374-.409l.526-5.784a.373.373 0 0 1 .333-.337 41.741 41.741 0 0 1 8.566 0Zm.967-3.97a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H18a.75.75 0 0 1-.75-.75V10.5ZM15 9.75a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75V10.5a.75.75 0 0 0-.75-.75H15Z" clipRule="evenodd" />
                                        </svg>
                                        Print
                                    </button>
                                </Buttons>
                                <Info>
                                    {recipe?.cookingTime && (
                                        <Cooking>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                        <p>{recipe?.cookingTime}</p>
                                        </Cooking>
                                    )}
                                    <p>By: <span>{recipe?.citation || 'N/A'}</span></p>
                                    <p>Reference: {recipe?.citationLink ? <a href={recipe?.citationLink} target="_blank">{recipe?.citationLink}</a> : 'N/A'}</p>
                                    <p>Posted: <span>{formattedCreatedAt}</span></p>
                                    {recipe.createdAt !== recipe.updatedAt && (
                                        <p>Updated: <span>{formattedUpdatedAt}</span></p>
                                    )}
                                </Info>
                                <Description>{recipe.description}</Description>
                                <RecipeImageContainer>
                                <RecipeImage>
                                    <img src={recipe.images?.[activeImageIndex]} alt="" />
                                    {recipe.images.length > 1 && (
                                    <div>
                                        <PreviousButton onClick={handlePrevImage}>{PreviousIcon}</PreviousButton>
                                        <NextButton onClick={handleNextImage}>{NextIcon}</NextButton>
                                    </div>
                                    )}
                                </RecipeImage>
                                </RecipeImageContainer>

                                {recipe.videoLink && (
                                    <VideoContainer id="videoContainer">
                                        <TextLabel>How to Cook {recipe.title}</TextLabel>
                                        <YouTube
                                            videoId={recipe.videoLink}
                                            opts={{ width: '100%', height: '400' }}
                                        />
                                    </VideoContainer>
                                )}
                                <div>
                                    <ProcedureContainer>
                                        <TextLabel>Procedure</TextLabel>
                                        <SpeechButton onClick={speakProcedure} disabled={!supported}>
                                            {isSpeaking ? (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000" className="w-6 h-6">
                                                        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
                                                    </svg>
                                                    <p>Stop</p>
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#008000" className="w-6 h-6">
                                                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                                                    </svg>
                                                    <p>Play</p>
                                                </>
                                            )}
                                        </SpeechButton>
                                        {procedureSteps}
                                    </ProcedureContainer>
                                </div>
                            </LeftColumn>
                            <RightColumn>
                                <IngredientsContainer>
                                <Label>Ingredients</Label>
                                <ServingsControls>
                                    <ServingsLabel>
                                    Servings: {servings}
                                    </ServingsLabel>                                    
                                    <SetContainer>
                                        <ServingsButton onClick={decreaseSets}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
                                            </svg>
                                            </ServingsButton>
                                            <SetLabel>{sets} {sets === 1 ? 'set' : 'sets'}</SetLabel>
                                            <ServingsButton onClick={increaseSets}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                            </svg>
                                        </ServingsButton>
                                    </SetContainer>
                                </ServingsControls>
                                {servingsChanged && (
                                    <Message>
                                        Please note that this recipe is originally designed for {originalServings} servings.
                                        Adjust quantities and cooking times as needed for {servings} servings.
                                    </Message>
                                )}
                                <List>
                                        {updatedIngredients.map((ingredient, index) => (
                                            <ListItem key={index}>
                                                <Name>{ingredient.quantity} {ingredient.measurement}</Name>
                                                <Name>{ingredient.name}</Name>
                                            </ListItem>
                                        ))}
                                </List>
                                </IngredientsContainer>
                                
                                <NutritionalValuesContainer>
                                <Label>Nutritional Values</Label>
                                <List>
                                    <Name>{nutriValueList}</Name>
                                </List>
                            </NutritionalValuesContainer>
                            </RightColumn>
                        </ColumnWrapper>
                        <FeedbackContainer>
                            <Feedback>
                            <h2>Leave A Comment</h2>
                            <p>Submit your question or comment below.</p>
                            <CommentContainer>
                                <p>Comment*</p>
                                <textarea
                                    value={newCommentText}
                                    onChange={e => setNewCommentText(e.target.value)}
                                    placeholder="Add your comment..."
                                />
                            </CommentContainer>
                                <button onClick={handleAddComment}>Submit Comment</button>
                            </Feedback>
                            <CommentBox>
                                <h2>Comments</h2>
                                {comments.filter((comment) => comment.approved).length === 0 ? (
                                    <p>No comments yet. Be the first to comment!</p>
                                ) : (
                                    comments
                                        .filter((comment) => comment.approved)
                                        .map((comment) => (
                                            <Comment key={comment._id}>
                                                <FullName>
                                                    {comment?.user?.firstName || comment?.user?.lastName
                                                        ? `${comment.user.firstName} ${comment.user.lastName}`
                                                        : 'Deleted User'}
                                                </FullName>
                                                <PostedDate>
                                                    Posted on {format(new Date(comment.createdAt), 'MMMM dd, yyyy')}
                                                </PostedDate>
                                                <span>{comment.text}</span>
                                            </Comment>
                                        ))
                                )}
                            </CommentBox>
                        </FeedbackContainer>
                    </div>
                    <ScrollToTopButton />
                </Center>
                <Footer />
            </PageWrapper>
            <SideWindow isOpen={isSideWindowOpen} onClose={toggleSideWindow} />
      {!isSideWindowOpen && (
              <IconButtons
              className="icon-button"
              onClick={toggleSideWindow}
              isSideWindowOpen={isSideWindowOpen}
            >
              {isSideWindowOpen ? (
                <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                </Icon>
                ) : (
                <>
                    {bagRecipes.length > 0 && (
                      <BagLength>
                        {bagRecipes.length}
                      </BagLength>
                    )}
                  <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z" clipRule="evenodd" />
                  </Icon>
                </>
              )}
            </IconButtons>
        )}
        </div>
    );
}

export async function getServerSideProps(context) {
    await mongooseConnect();
    const { id } = context.query;

    if (!mongoose.models.Category) {
        mongoose.model('Category', CategorySchema);
    }

    const recipe = await Recipe.findById(id).populate("category");

    recipe.category = Array.isArray(recipe.category) ? recipe.category : [recipe.category];

    return {
        props: {
            recipe: JSON.parse(JSON.stringify(recipe)),
        },
    };
}