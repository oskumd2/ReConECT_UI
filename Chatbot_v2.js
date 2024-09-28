import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

import lower_extremity_photo_1 from './Lower_Extremity_Photo_1.png';
import upper_extremity_photo_1 from './Upper_Extremity_Photo_1.png';
import upper_extremity_photo_2 from './Upper_Extremity_Photo_2.png';
import upper_extremity_photo_3 from './Upper_Extremity_Photo_3.png';
import upper_extremity_photo_4 from './Upper_Extremity_Photo_4.png';
import upper_extremity_photo_5 from './Upper_Extremity_Photo_5.png';
import upper_extremity_photo_6 from './Upper_Extremity_Photo_6.png';
import upper_extremity_photo_7 from './Upper_Extremity_Photo_7.png';
import upper_extremity_photo_8 from './Upper_Extremity_Photo_8.png';
import upper_extremity_photo_9 from './Upper_Extremity_Photo_9.png';
import upper_extremity_photo_10 from './Upper_Extremity_Photo_10.png';
import upper_extremity_photo_11 from './Upper_Extremity_Photo_11.png';
import upper_extremity_photo_12 from './Upper_Extremity_Photo_12.png';
import upper_extremity_photo_13 from './Upper_Extremity_Photo_13.png';
import low_back_pain_photo_1 from './Low_Back_Pain_Photo_1.png';
import cue_t_photo_1 from './CUE_T_Photo_1.png';
import cue_t_photo_2 from './CUE_T_Photo_2.png';
import cue_t_photo_3 from './CUE_T_Photo_3.png';


const ChatContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: #ffffff;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const MessageWrapper = styled.div`
    display: flex;
    justify-content: ${props => props.user ? 'flex-end' : 'flex-start'};
    align-items: center;
    margin-bottom: 10px;
`;
const UserMessage = styled.div`
  align-self: flex-end;
  background: #6a5acd;
  color: white;
  padding: 10px 15px;
  border-radius: 15px;
  max-width: 60%;
  word-wrap: break-word;
  
`;

const BotMessage = styled.div`
  align-self: flex-start;
  background: #e8eaf6;
  color: #333;
  padding: 10px 15px;
  border-radius: 15px;
  max-width: 60%;
  word-wrap: break-word;

`;

const InputContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 10px;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
`;

const SendButton = styled.button`
  padding: 10px 20px;
  background: #6a5acd;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background: #b06ab3;
  }
`;

const StyledButton = styled.button`
  margin-right: 10px;
  background: #f0a500;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;

  &:hover {
    background: #d48800;
  }
`;

const YouTubeEmbed = ({ videoId }) => (
    <iframe 
      width="300" 
      height="225" 
      src={`https://www.youtube.com/embed/${videoId}`}
      style={{
        border: '1px solid #ccc',
        borderRadius: '10px',
      }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowFullScreen
    ></iframe>
  );

  
function Chatbot_v2() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [currentStep, setCurrentStep] = useState('initial');
    const [patientInfo, setPatientInfo] = useState({});
    const [disabilities, setDisabilities] = useState([]);
    const [decreased_items, setDecreased_items] = useState([[]]);
    const [diagnosis, setDiagnosis] = useState('');
    const [emptyDisabilities, setEmptyDisabilities]= useState([])
    const [ID, setID] = useState('');
    const [Password, setPassword] = useState('');

    const questions_Lower_Extremity = [
        { key: "patient_chief_complaint", question: "Could you please tell me what's been bothering you the most?", validator: (x) => x.length > 0 },
        { key: "Q1", question: "When did you first notice this issue?", validator: (x) => x.length > 0 },
        { key: "Q2", question: (
            <>
                I'd like to understand where you're feeling discomfort. Could you point out the areas that hurt? It might be in your buttock, hip, thigh, calf, or knee. Here's a picture to help you. See Photo 1.<br />
                <img src={lower_extremity_photo_1} alt="LE Photo 1" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.length > 0 },
        { key: "Q3", question: "Can you describe where the pain is located? Is it in the front, back, side, or inner part of your leg?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Is the pain on your right side, left side, or both?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "Sometimes pain can spread to other areas. Have you noticed the pain extending to your lower back, bottom, or any other parts of your body?", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Have you ever felt like your joint gets stuck or doesn't move as smoothly as it should?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q7", question: "Do you hear any clicking or rubbing sounds in your joint when you move, and does it hurt when this happens?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "Have you noticed any clicking sounds in your joint that don't cause pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q9", question: "Does the painful area ever feel warm to the touch?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q10", question: "Have you noticed any bruising in the area where it hurts?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q11", question: "Is there any swelling in the specific area where you feel pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q12", question: "Have you experienced any unusual sensations, like tingling or numbness, in your bottom, thigh, or foot?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "Have you had any accidents recently, like a car crash or a fall?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q14", question: "Have you been playing soccer or doing any activities that involve stretching a lot, like gymnastics?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q15", question: "If you're an athlete, could you tell me what sport you play?", validator: (x) => x.length > 0 },
        { key: "Q16", question: "Have you traveled to any other countries recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "Does the pain get worse when you walk or run?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: "Do you notice the pain more when you're sitting down?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: "Does the pain increase when you do exercises that put weight on your legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "After you exercise, do you find that the pain gets worse?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: "If you keep your knee bent for a long time, does it start to hurt more?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "Does lying down help to ease the pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "Would you mind telling me your age?", validator: (x) => x.length > 0 },
        { key: "Q24", question: "Could you let me know if you're male or female?", validator: (x) => x.toLowerCase() === 'female' || x.toLowerCase() === 'male' },
        { key: "Q25", question: "Do you notice any pain when you're walking up stairs or sitting for a long time?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q26", question: "Has a doctor ever told you that you have osteoporosis?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q27", question: "Have you ever been diagnosed with any of these conditions: cancer, stroke, deep vein thrombosis, heart failure, pregnancy, varicose veins, nephrotic syndrome, rheumatological disease, or acute inflammatory bowel disease?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q28", question: "Have you recently had any hormone treatments, chemotherapy, taken birth control pills, been unable to move for a long time, or been on a long flight?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q29", question: (
            <>
                I'd like to check something called the FABER test. Could you try the movement shown in this video and let me know if it causes any pain? See Video 1 for instructions.<br />
                <YouTubeEmbed videoId="Nvc7YsxdD28" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: "If I were to gently press on the area that's sore, would it be painful?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: (
            <>
                Now, I'd like you to try another test called the Pace maneuver. Could you follow the instructions in this video and tell me if you feel any pain? See Video 2 for instructions.<br />
                <YouTubeEmbed videoId="WhuPgPx4GtM" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q32", question: (
            <>
                Let's try one more test called the Lachman test. Could you watch this video and try the movement? Let me know if you feel any pain or unusual movement. See Video 3 for instructions.<br />
                <YouTubeEmbed videoId="gfN-p-xZx24" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q33", question: (
            <>
                Now we'll do something called the Reverse Lachman test. Could you follow the instructions in this video and tell me what you feel? See Video 4 for instructions.<br />
                <YouTubeEmbed videoId="sXlW2lPXf4s" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q34", question: (
            <>
                Let's try the Valgus stress test. Could you watch this video and try the movement? Please let me know if you feel any pain or instability. See Video 5 for instructions.<br />
                <YouTubeEmbed videoId="ys8JxW79m2E" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q35", question: (
            <>
                Lastly, we'll do the McMurray test. Could you follow the instructions in this video and tell me if you feel or hear anything unusual? See Video 6 for instructions.<br />
                <YouTubeEmbed videoId="nqp7PwEj0Es" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q36", question: "If I were to gently press on the front of your knee, would it be painful?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q37", question: "Are you having trouble bending your knees to a 90-degree angle?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q38", question: "When you try to walk, do you find it difficult to take four steps without support?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q39", question: "Have you noticed any changes in the color of your skin in the affected area?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q40", question: "Do you feel like the muscles in your leg are weaker than usual?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q41", question: "When you walk, do you notice that you're limping?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q42", question: "Have you ever had surgery on your hip, taken steroids, or received injections directly into your joint?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }
    ];

    const questions_Upper_Extremity = [
        { key: "patient_chief_complaint", question: "Could you please tell me what's been bothering you the most?", validator: (x) => x.length > 0 },
        { key: "Q1", question: "When did you first notice this issue?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Could you point out where it hurts? It might be in your shoulder area, shoulder joint, upper arm, elbow, forearm, wrist, or fingers.", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Can you describe where the pain is located? Is it in the front, back, side, inner part, top, or bottom of your arm?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Is the pain on your right side, left side, or both?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "Sometimes pain can spread to other areas. Have you noticed the pain extending to your upper arm or forearm?", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Did the pain start suddenly or did it develop gradually over time?", validator: (x) => x.length > 0 },
        { key: "Q7", question: "Have you been experiencing any fever or night sweats recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "Have you noticed any unintentional weight loss lately?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q9", question: "Have you developed any new breathing issues, like difficulty breathing, coughing, or producing phlegm?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q10", question: "Do you feel like your arm is weaker than usual?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q11", question: "Have you noticed that your grip strength isn't as strong as it used to be?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q12", question: "When you try to straighten your elbow, does it feel weaker compared to your other arm?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "Do you hear a clicking sound when you bend or straighten your elbow?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q14", question: (
            <>
                When you bend your wrist, do you hear a rubbing sound near this bone? See Photo 1.<br />
                <img src={upper_extremity_photo_1} alt="UE Photo 1" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q15", question: "Do you hear any friction or rubbing sounds when you bend or straighten your wrist?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "Have you noticed that your wrist doesn't move as freely as it used to?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "Have you ever felt like your wrist gets stuck or catches when you move it?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: (
            <>
                Do you find it difficult to straighten this joint in your finger? See Photo 2.<br />
                <img src={upper_extremity_photo_2} alt="UE Photo 2" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: (
            <>
                Is it hard to straighten the tip of your finger? See Photo 2.<br />
                <img src={upper_extremity_photo_2} alt="UE Photo 2" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "Do you have trouble bending the tip of your finger?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: (
            <>
                When you bend your fingers, do they ever get stuck or snap like in this video? See Video 1.<br />
                <YouTubeEmbed videoId="8hq9K96rM1c" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "Have you noticed a lump near your elbow that's growing quickly?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "Does the pain get worse when you're trying to sleep?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q24", question: "If you lie on the side that's hurting, does the pain increase?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q25", question: "Is there a specific position, like when you're throwing a ball or serving in tennis, that causes pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q26", question: "Have you been lifting heavy objects recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q27", question: (
            <>
                When you bend your fingers, do they ever get stuck or snap like in this video? See Video 2.<br />
                <YouTubeEmbed videoId="R3xJDsJ_Nw4" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q28", question: "Have you had any recent injuries in the area where you're feeling pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q29", question: "Does the pain get worse when you grip something tightly?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: (
            <>
                When you bend your wrist or turn your palm down like this, does it hurt more? See Photo 3.<br />
                <YouTubeEmbed videoId="Nvc7YsxdD28" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: (
            <>
                Do you feel pain in this area when you bend your elbow or throw something? See Photo 4.<br />
                <img src={upper_extremity_photo_4} alt="UE Photo 4" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q32", question: (
            <>
                When you lift heavy objects, do you feel pain in this area? See Photo 4.<br />
                <img src={upper_extremity_photo_4} alt="UE Photo 4" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q33", question: "Does straightening your elbow make the pain worse?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q34", question: "Have you been playing racket sports or golf more often than usual lately?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q35", question: "After playing racket sports, golf, or going fishing, does the pain get worse?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q36", question: "Have you been doing any activities that involve your thumb a lot, like using scissors?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q37", question: "Have you ever had steroid injections in your elbow or taken oral steroids?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q38", question: "Did you notice the pain after gripping something tightly?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q39", question: "Has a doctor ever told you that you have breast or lung cancer?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q40", question: "After an injury, did you notice your elbow starting to swell?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q41", question: "A day or two after hurting your wrist or finger, did the pain get worse?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q42", question: "Even after resting, using ice, keeping the area still, and taking pain medication for a few days, is the pain still there?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q43", question: (
            <>
                Do you see a dip on the side of your shoulder like this? See Photo 5.<br />
                <img src={upper_extremity_photo_5} alt="UE Photo 5" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q44", question: (
            <>
                When someone else moves your shoulder, can you move it further than when you try to move it yourself? See Video 3 and 4.<br />
                <YouTubeEmbed videoId="cP4LLJie9kw" /><br />
                <YouTubeEmbed videoId="n9HQIw1LHDY" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q45", question: (
            <>
                Compared to your healthy shoulder, is it harder to move your affected shoulder in all directions? See Video 3 and 4.<br />
                <YouTubeEmbed videoId="cP4LLJie9kw" /><br />
                <YouTubeEmbed videoId="n9HQIw1LHDY" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q46", question: (
            <>
                Is it difficult to move your shoulder both when you try to move it and when someone else moves it for you? See Video 3 and 4.<br />
                <YouTubeEmbed videoId="cP4LLJie9kw" /><br />
                <YouTubeEmbed videoId="n9HQIw1LHDY" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q47", question: (
            <>
                Compared to your healthy shoulder, is it harder to move your affected shoulder in certain directions? See Video 3 and 4.<br />
                <YouTubeEmbed videoId="cP4LLJie9kw" /><br />
                <YouTubeEmbed videoId="n9HQIw1LHDY" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q48", question: (
            <>
                Does it hurt when I gently press here or around this area? See Video 5.<br />
                <YouTubeEmbed videoId="U31quA3ZsjY" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q49", question: "Does your neck feel sore when I gently touch it?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q50", question: "Have you noticed any swelling or a lump around your shoulder?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q51", question: "Is the area around your shoulder red or warm to the touch?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q52", question: (
            <>
                Does it hurt when I gently press this part of your elbow? See Photo 6.<br />
                <img src={upper_extremity_photo_6} alt="UE Photo 6" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q53", question: "Is it painful when I lightly touch this inner part of your elbow?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q54", question: "Could you tell me if you've noticed any bruising, swelling, or redness in the inner part of your elbow, where it bends?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q55", question: (
            <>
                When you bend your elbow, do you notice a shape that looks a bit like Popeye's muscle, as shown in this picture? See Photo 7.<br />
                <img src={upper_extremity_photo_7} alt="UE Photo 7" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q56", question: "If I were to gently touch the back of your upper arm, near your elbow, would you feel any discomfort or tenderness?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q57", question: "Have you noticed any redness, bruising, or swelling at the point where the muscle at the back of your upper arm connects to your elbow?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q58", question: (
            <>
                If you look at the pointy part of your elbow, as shown in this picture, do you see any redness, feel any warmth, or notice any swelling? See Photo 8.<br />
                <img src={upper_extremity_photo_8} alt="UE Photo 8" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q59", question: "When you touch your elbow, does it feel both tender and swollen to you?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q60", question: "On the side of your wrist closest to your little finger, or on the back of your wrist, do you notice any localized swelling or feel any tenderness?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q61", question: "If you gently press on the side of your wrist closest to your thumb, does it feel tender or uncomfortable?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q62", question: (
            <>
                I'd like you to try a simple movement, as shown in this video. Does it cause any discomfort? See Video 6.<br />
                <YouTubeEmbed videoId="Dm-_pumHt9c" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q63", question: (
            <>
                If you look at this picture and then feel the same area on your own wrist, does it feel tender or uncomfortable? See Photo 9.<br />
                <img src={upper_extremity_photo_9} alt="UE Photo 9" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q64", question: "When you gently press on the back of your wrist, does it feel tender or uncomfortable?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q65", question: (
            <>
                In this picture, you can see an area called the anatomical snuffbox. Have you noticed any swelling or bruising in this area on your own hand? See Photo 10.<br />
                <img src={upper_extremity_photo_10} alt="UE Photo 10" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q66", question: "On the side of your forearm closest to your thumb, near your wrist, have you noticed any tenderness, localized swelling, or bruising?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q67", question: (
            <>
                This picture shows a bone in your wrist called the lunate. If you press gently in this area, does it feel tender? See Photo 11.<br />
                <img src={upper_extremity_photo_11} alt="UE Photo 11" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q68", question: "If you gently press in the hollow area at the back of your wrist, between two tendons, does it feel tender or uncomfortable?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q69", question: "When you touch the back of your finger, does it feel tender or uncomfortable?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q70", question: "Can you try to straighten the middle joint of your finger on your own? Now, if I were to gently help you straighten it, would that be possible? I'm trying to understand if there's any difference between these two movements.", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q71", question: "Have you noticed any redness, bruising, or swelling on the back of the joint closest to the tip of your finger?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q72", question: (
            <>
                If you look at this picture and then gently press the same area on your own thumb, does it feel tender or uncomfortable? See Photo 12.<br />
                <img src={upper_extremity_photo_12} alt="UE Photo 12" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q73", question: "When you gently press on the sides of any of the joints in your fingers, do you feel any tenderness or discomfort?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q74", question: (
            <>
                This picture shows an area of your finger called the A1 pulley. When you touch this area on your own fingers, do you feel any tenderness or notice any small lumps? See Photo 13.<br />
                <img src={upper_extremity_photo_13} alt="UE Photo 13" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q75", question: "If you were to raise your arm and place your hand on top of your head, would that help relieve any pain you might be feeling in your shoulder?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q76", question: "Would you mind sharing your age with me? It can be helpful in understanding your condition better.", validator: (x) => x.length > 0 }
    ];

    const questions_Low_Back_Pain = [
        { key: "patient_chief_complaint", question: "Could you please tell me what's bothering you the most right now?", validator: (x) => x.length > 0 },
        { key: "Q1", question: "When did you first notice this discomfort?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Did the pain come on suddenly, or did it develop more gradually over time?", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Can you describe where you're feeling the pain? Is it in the center of your back, or more towards the sides?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Is the pain on your right side, left side, or both?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "If the pain spreads to other areas, could you tell me where? For example, does it go down to your thigh, calf, or foot?", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Have you noticed any discomfort in your perineal area or buttocks?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q7", question: "Has the pain been constant since it started, or has it changed over time, with some periods feeling better or worse?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "Have you ever experienced this type of pain before?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q9", question: "On a scale from 0 to 10, where 0 is no pain and 10 is the worst pain imaginable, how would you rate your pain?", validator: (x) => x.length > 0 },
        { key: "Q10", question: "Have you noticed any unintended weight loss recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q11", question: "Have you had any fever recently that might indicate an infection?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q12", question: "Have you experienced any recent changes in your bowel movements or urination?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "Have you noticed any ongoing weakness in your legs or changes in the way you walk?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q14", question: "Do you feel stiffness in your back, especially in the morning?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q15", question: "Are you experiencing pain in any other joints besides your back?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "Have you noticed any changes in the color of your toes?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "Have you noticed any rashes on your legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: "Have you recently experienced any eye inflammation, skin rashes, diarrhea, or unusual discharge from your urethra?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: "Does your back pain or any pain radiating to your legs get worse when you bend over?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "Does lying down help relieve the pain, but standing up makes it worse?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: "Does the pain stay the same regardless of your position, such as sitting or lying down?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "Do you feel pain when you straighten up after bending over, or when you cough or sneeze?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "Does the pain occur when you stand for a long time or when you walk?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q24", question: "If you don't mind me asking, how old are you?", validator: (x) => x.length > 0 },
        { key: "Q25", question: "When you walk for a while, do you feel pain in both legs or in one hip? Does bending your back help relieve this pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q26", question: "Do you find that exercise helps to reduce the pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q27", question: "Does the pain persist even after you've rested?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q28", question: "Does the pain tend to get worse during the night?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q29", question: "Have you been involved in any serious accidents recently, such as a car accident or a fall?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: "Are you currently undergoing treatment for cancer?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: "Have you taken any oral steroid medications recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q32", question: "Have you used any recreational drugs recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q33", question: "Do you have HIV or any condition that might weaken your immune system?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q34", question: "Have you noticed any difference in the size of your leg muscles, with one side appearing smaller than the other?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q35", question: (
            <>
                Looking at this image, does the curve in your lower back stay the same whether you're sitting or standing? See Photo 1.<br />
                <img src={low_back_pain_photo_1} alt="LBP Photo 1" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q36", question: (
            <>
                Referring to this image again, does the curve in your lower back flatten out when you walk? See Photo 1.<br />
                <img src={low_back_pain_photo_1} alt="LBP Photo 1" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },     
        { key: "Q37", question: "Have you noticed any sideways curvature of your spine?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q38", question: "When you walk, do you find that your toes drag on the ground, or do you need to lift your knees higher than usual to prevent this?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q39", question: (
            <>
                Could you try the movement shown in this video? Does it cause any discomfort? See Video 1.<br />
                <YouTubeEmbed videoId="e2aRRkuS7eg" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },     
        { key: "Q40", question: "During the movement you just tried, did the pain get worse when you bent forward?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q41", question: "Did the pain increase when you straightened your back after that movement?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q42", question: (
            <>
                Could you try the movement shown in this video? Are you able to raise both legs more than 60 degrees? See Video 2.<br />
                <YouTubeEmbed videoId="RKs1grlLDpU" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },  
        { key: "Q43", question: "If I were to gently press on different areas of your lower back, would you feel widespread tenderness or pain even with light pressure?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q44", question: "For medical purposes, could you please tell me your gender?", validator: (x) => x.toLowerCase() === 'male' || x.toLowerCase() === 'female' }
    ];

    const questions_Neck_Pain = [
        { key: "patient_chief_complaint", question: "Could you please tell me what's bothering you the most right now?", validator: (x) => x.length > 0 },
        { key: "Q1", question: "When did you first notice this discomfort?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Did the pain come on suddenly or develop gradually over time?", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Where exactly do you feel the discomfort? Is it in the front, back, side, or inner part of your neck?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Is the pain on your right side, left side, or both sides?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "If the pain spreads to other areas, could you describe where? For example, does it go to your shoulder, upper arm, forearm, fingers, or head?", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Do you feel pain on just one side of your head, or in areas like the back of your head, around your ears, jaw, or cheekbone?", validator: (x) => x.length > 0 },
        { key: "Q7", question: "Have you been experiencing a constant headache?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "Along with your neck pain, are you also having severe pain in your arm?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q9", question: "Have you noticed any weakness or thinning of muscles in your arms or legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q10", question: "Is the weakness more noticeable in your legs compared to your arms?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q11", question: "Do you experience any numbness or unusual sensations in your arms or legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q12", question: "Have you recently felt dizzy, had any vision problems, or heard ringing in your ears?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "If you don't mind me asking, how old are you?", validator: (x) => x.length > 0 },
        { key: "Q14", question: "For medical purposes, could you please tell me your gender?", validator: (x) => x.toLowerCase() === 'female' || x.toLowerCase() === 'male' },
        { key: "Q15", question: "Does the pain get worse when you cough, sneeze, or strain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "Does tilting your head backward make the pain worse?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "Have you had any recent accidents or injuries?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: "Have you recently fallen from a significant height, like more than 5 stairs or over 90 meters?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: "Did you hurt your neck while diving?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "Have you been in a severe car accident recently? For example, were you hit from behind at high speed, thrown from the vehicle, or was the vehicle overturned?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: "Have you been in a motorcycle or bicycle accident recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "Has a doctor ever told you that you have osteoporosis?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "Have you ever been treated with corticosteroids?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q24", question: "Are you currently undergoing treatment for cancer?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q25", question: "Have you lost weight recently without trying to?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q26", question: "Have you been receiving treatment for your neck pain for over a month without seeing any improvement?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q27", question: "Have you noticed any changes in your bowel movements or ability to urinate?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q28", question: "Have you ever used intravenous drugs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q29", question: "Have you had any surgeries on your neck in the past?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: "Does raising the arm on the side where you feel pain above your head help to relieve the pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: (
            <>
                Could you try the movement shown in this video? Does your middle finger twitch or curl when the doctor flicks it? See Video 1.<br />
                <YouTubeEmbed videoId="GJ-Q2ibYAHs" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q32", question: (
            <>
                Could you try the movement shown in this video? When your foot is stroked, does your big toe move upward while the other toes fan out? See Video 2.<br />
                <YouTubeEmbed videoId="XMKEAm63SoM" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q33", question: (
            <>
                Could you try the movement shown in this video? When your head is tilted back and to the side, does it cause pain or tingling in your arm? See Video 3.<br />
                <YouTubeEmbed videoId="h8GxF73P6GQ" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q34", question: (
            <>
                Could you try the movement shown in this video? When you bend your neck forward, do you feel an electric shock-like sensation down your spine or into your arms or legs? See Video 4.<br />
                <YouTubeEmbed videoId="mDQ-UdK-PDs" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q35", question: "Is there a specific spot on the side of your neck that's particularly tender when touched?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q36", question: (
            <>
                Could you try the movement shown in this video? When the doctor taps just below your kneecap, does your lower leg jerk more strongly than usual? See Video 5.<br />
                <YouTubeEmbed videoId="K7FEm8JnV-s" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q37", question: "Is there a tender spot where the back of your head meets your neck?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q38", question: "Have you noticed that it's harder to move your neck, or does it feel stiff when you try to move it?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }
    ];

    const complication_questions_Traumatic_Brain_Injury = [
        { key: "Q1", question: "How long ago were you diagnosed with a traumatic brain injury?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Have you been feeling sick to your stomach, throwing up, or noticed any drooping?", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Are you experiencing a constant headache? If you're having trouble communicating, have you noticed any agitation or swelling?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Would you describe your headache as stabbing or sharp, like a knife? Does your head hurt even when lightly touched?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "Have you noticed any changes in your walking, memory, or ability to control your bladder?", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Have you been feeling unusually tired, sensitive to cold, depressed, or having problems with your menstrual cycle, thinking, or memory?", validator: (x) => x.length > 0 },
        { key: "Q7", question: "Have you recently experienced fever, high blood pressure, sweating, rapid breathing, a fast heartbeat, unusual posture, or muscle stiffness?", validator: (x) => x.length > 0 },
        { key: "Q8", question: "Are you having any trouble breathing, or noticing more mucus or coughing?", validator: (x) => x.length > 0 },
        { key: "Q9", question: "Have you noticed any changes in your sense of smell, or any blind spots that look different in each eye, or any decrease in your vision?", validator: (x) => x.length > 0 },
        { key: "Q10", question: "Do your arms or legs feel stiff or difficult to move?", validator: (x) => x.length > 0 },
        { key: "Q11", question: "Do you have any joints that are swollen, warm, painful, or hard to move? This might include your hip, elbow, shoulder, or knee.", validator: (x) => x.length > 0 },
        { key: "Q12", question: "Have you been having trouble sleeping, sleeping too much, or feeling very sleepy during the day?", validator: (x) => x.length > 0 },
        { key: "Q13", question: "Is there anything else bothering you that we haven't talked about yet?", validator: (x) => x.length > 0 }
    ];

    const complication_questions_Stroke = [
        { key: "Q1", question: "Could you please tell me how much time has passed since you received your stroke diagnosis?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "In the days following your stroke, have you noticed any changes in your ability to concentrate, remember things, or communicate? These symptoms might come and go, sometimes getting better and sometimes worse.", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Have you noticed that your arms or legs feel stiffer than usual when you try to move them?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "When you're eating, do you ever experience any difficulties such as coughing, changes in your voice, trouble swallowing, or feeling like food is stuck in your throat?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "Have you been experiencing any pain in your shoulder area?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q6", question: "Have you noticed any changes in how far you can move your shoulder, especially when trying to rotate it outward or lift it to the side?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q7", question: "Have you recently noticed any swelling, warmth, or pain when moving your wrist or hand?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "In areas where you've been experiencing numbness or tingling, such as your face or limbs, have you started to feel any pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q9", question: "Do you experience any pain that gets worse when you're active and feels better when you're resting?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q10", question: "Do you ever feel pain that's triggered by movement, touch, or changes in temperature, even if these sensations wouldn't normally be painful?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q11", question: "Have you been experiencing any issues with constipation or difficulty controlling your bladder?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q12", question: "Have you been feeling persistently sad or down?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "Do you often find yourself feeling anxious?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q14", question: "Have you noticed that you're less interested in social activities or participating less in your rehabilitation programs than you used to?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q15", question: "Have you experienced any sudden chest pain recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "Have you been confined to bed for more than three days, or have you noticed any swelling or tenderness in your legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "Have you been coughing more than usual, noticed any changes in the color of your phlegm, or felt short of breath recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: "Have you been waking up more often during the night, or has anyone mentioned that your snoring has gotten louder?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: "Have you been experiencing any headaches lately?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "Has your doctor mentioned that you might be overweight, or do you know if your BMI is over 25?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: "Do you often feel sleepy or drowsy during the day?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "Do you have trouble falling asleep at night, or do you find yourself waking up in the middle of the night?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "Have you had any falls recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q24", question: (
            <>
                When you look at objects, do you ever see them as double? Or when you took the visual field test, did you notice any blind spots? I have a short video here that might help explain what I mean. See Video 1.<br />
                <YouTubeEmbed videoId="OodMJMPcITQ" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q25", question: "Is there anything else that's been bothering you or any other symptoms you'd like to mention that we haven't talked about yet?", validator: (x) => x.length > 0 }
    ];

    const complication_questions_Parkinsons_Disease = [
        { key: "Q1", question: "Could you tell me how long it's been since you were first diagnosed with Parkinson's Disease?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Are you currently taking any medication called levodopa?", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Do you often experience shaking or times when you feel like you can't control your walking, as if your feet are stuck to the ground?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Do you frequently experience pain, excessive sweating, a fast heartbeat, stomach discomfort, or feelings of depression or anxiety?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "Do you have any uncontrollable movements that make it difficult for you to sit, walk, or perform everyday tasks?", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Have you recently experienced any moments where you suddenly couldn't move at all?", validator: (x) => x.length > 0 },
        { key: "Q7", question: "Has there been any sudden change in your medication recently?", validator: (x) => x.length > 0 },
        { key: "Q8", question: "Have you been experiencing any constipation lately?", validator: (x) => x.length > 0 },
        { key: "Q9", question: "Have you been sweating more than usual recently, or have you been drinking less water than normal?", validator: (x) => x.length > 0 },
        { key: "Q10", question: "Have you had any injuries recently?", validator: (x) => x.length > 0 },
        { key: "Q11", question: "Have you ever experienced slow movements along with a fast heartbeat or sweating?", validator: (x) => x.length > 0 },
        { key: "Q12", question: "Have you had any recent difficulties with your bowel movements or urination?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "Have you been experiencing ongoing weakness in your legs or changes in the way you walk?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q14", question: "Do you notice that your back feels particularly stiff in the mornings?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q15", question: "Are you experiencing pain in any of your other joints?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "Have you noticed any changes in the color of the skin on your toes?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "Do you have any rashes on your legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: "Have you recently experienced any issues like eye inflammation, skin rashes, diarrhea, or unusual discharge from your urethra?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: "When you bend over, does your back pain and any pain radiating towards your legs get worse?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "Does your pain feel better when you lie down, but get worse when you stand up?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: "Does your pain stay the same regardless of your posture, whether you're sitting or lying down?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "Do you feel pain when you straighten your back after bending over, or when you cough or sneeze?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "Do you experience pain when you stand for a long time or when you walk?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q24", question: "Would you mind telling me your age?", validator: (x) => x.length > 0 },
        { key: "Q25", question: "When you walk for a long time, do you feel pain in both legs or in one hip? Does bending your back help relieve this pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q26", question: "Does your pain seem to get better when you exercise?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q27", question: "Does your pain continue even after you've rested?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q28", question: "Does your pain tend to get worse during the night?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q29", question: "Have you recently been involved in any serious accidents, such as a traffic accident or a fall?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: "Are you currently undergoing treatment for cancer?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: "Have you taken any oral steroid medications recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q32", question: "Have you used any recreational drugs recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q33", question: "Have you been diagnosed with HIV, or are you currently in a state where your immune system is weakened?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q34", question: "Have you noticed any significant difference in the size of the muscles between your two legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q35", question: (
            <>
                When you look at your lower back, does the forward curve (what we call lumbar lordosis) look the same whether you're sitting or standing? I have a photo here that might help explain what I mean. See Photo 1.<br />
                <img src={low_back_pain_photo_1} alt="LBP Photo 1" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q36", question: (
            <>
                When you walk, does the forward curve in your lower back (lumbar lordosis) seem to disappear? Here's that photo again to help you understand what I'm asking. See Photo 1.<br />
                <img src={low_back_pain_photo_1} alt="LBP Photo 1" style={{ width: '300px', height: '225px', borderRadius: '10px' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },     
        { key: "Q37", question: "Have you or anyone else noticed any sideways curvature of your spine, which we call scoliosis?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q38", question: "When you walk, do you notice your toes dragging on the ground, or do you find yourself lifting your knees higher than usual to prevent this from happening?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q39", question: (
            <>
                I'd like to ask about a test called the Schober Test. Have you had this test done, and if so, was it positive? I have a short video here that shows how this test is performed. See Video 1.<br />
                <YouTubeEmbed videoId="e2aRRkuS7eg" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },     
        { key: "Q40", question: "During the Schober test, did you notice that your pain got worse when you bent forward?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q41", question: "When you straightened your back during the Schober test, did your pain increase?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q42", question: (
            <>
                There's another test called the Straight Leg Raise. When this test is done, are you able to raise both of your legs more than 60 degrees? I have a video here that demonstrates this test. See Video 2.<br />
                <YouTubeEmbed videoId="RKs1grlLDpU" />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },  
        { key: "Q43", question: "(For guardians) When you press on different areas of the patient's lower back, do they complain of widespread tenderness or pain even when you press softly?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q44", question: "Would you be comfortable sharing your gender with me? The options are male or female.", validator: (x) => x.toLowerCase() === 'male' || x.toLowerCase() === 'female' }
    ];

    const complication_questions_Spinal_Cord_Injury = [
        { key: "Q1", question: "If you don't mind sharing, could you tell me how long it's been since your spinal cord injury diagnosis?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Have you noticed any recent changes in your breathing, such as a new cough, different colored sputum, feeling short of breath, or having a fever?", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Have you experienced any chest discomfort lately, especially when you're breathing?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "How have you been sleeping lately? Have you found yourself waking up more often or has anyone mentioned that your snoring has gotten louder?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "Have you been feeling dizzy, lightheaded, or unusually pale? Or have you noticed any muscle weakness, fatigue, or fainting spells?", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Have you been experiencing any headaches or unusual sweating?", validator: (x) => x.length > 0 },
        { key: "Q7", question: "Have you noticed your face feeling flushed or your nose feeling stuffy more often than usual?", validator: (x) => x.length > 0 },
        { key: "Q8", question: "Have you had any difficulties with urinating or with your catheter, if you use one?", validator: (x) => x.length > 0 },
        { key: "Q9", question: "Have you experienced any changes in your bladder control, such as unexpected leaks or difficulty emptying your bladder completely?", validator: (x) => x.length > 0 },
        { key: "Q10", question: "Have you been having any issues with severe constipation?", validator: (x) => x.length > 0 },
        { key: "Q11", question: "Have you had any trouble controlling your bowel movements?", validator: (x) => x.length > 0 },
        { key: "Q12", question: "Have you noticed any changes in your muscle control, such as unusual tightness, sudden movements, or painful spasms?", validator: (x) => x.length > 0 },
        { key: "Q13", question: "Do you experience any pain when walking or using your arms, for example when using a manual wheelchair?", validator: (x) => x.length > 0 },
        { key: "Q14", question: "Have you been feeling any unusual sensations like burning, aching, tingling, or sharp pains?", validator: (x) => x.length > 0 },
        { key: "Q15", question: "Have you noticed any changes in your skin, particularly over bony areas like your hips, tailbone, or heels?", validator: (x) => x.length > 0 },
        { key: "Q16", question: "(For caregivers) Do you have any concerns about the patient's nutrition?", validator: (x) => x.length > 0 },
        { key: "Q17", question: "Do you experience any discomfort when moving from your bed to a chair?", validator: (x) => x.length > 0 },
        { key: "Q18", question: "Have you noticed any tenderness around your knee area?", validator: (x) => x.length > 0 },
        { key: "Q19", question: "Is there anything else you'd like to share about how you're feeling that we haven't covered yet?", validator: (x) => x.length > 0 }
    ];

    const complication_questions_ALS = [
        { key: "Q1", question: "If you're comfortable sharing, could you tell me how long it's been since you were diagnosed with ALS?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Have you noticed any changes in your saliva production or experienced any drooling?", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Are you having any trouble coughing up phlegm?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Have you experienced any changes in your emotional responses, like laughing or crying at unexpected times, or feeling more anxious than usual?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "Have you noticed any changes in your muscle control, such as unusual tightness or sudden movements?", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Are you experiencing any muscle cramps that are affecting your daily activities or sleep?", validator: (x) => x.length > 0 },
        { key: "Q7", question: "Have you noticed any changes in your swallowing or voice, especially after eating?", validator: (x) => x.length > 0 },
        { key: "Q8", question: "How is your breathing? Do you ever feel short of breath, even when resting?", validator: (x) => x.length > 0 },
        { key: "Q9", question: "How have you been sleeping lately? Have you noticed any changes in your sleep patterns, appetite, or ability to concentrate?", validator: (x) => x.length > 0 },
        { key: "Q10", question: "How has your mood been lately? Have you noticed any changes in your interest levels or motivation?", validator: (x) => x.length > 0 },
        { key: "Q11", question: "Have you been feeling more tired or less focused than usual?", validator: (x) => x.length > 0 },
        { key: "Q12", question: "(For caregivers) Have you noticed any changes in the patient's behavior or cognitive abilities?", validator: (x) => x.length > 0 },
        { key: "Q13", question: "How have you been sleeping? Are you having any difficulties?", validator: (x) => x.length > 0 },
        { key: "Q14", question: "Have you been experiencing any pain in your muscles or joints, particularly in your neck or shoulder area?", validator: (x) => x.length > 0 },
        { key: "Q15", question: "Would you mind sharing your age with me?", validator: (x) => x.length > 0 },
        { key: "Q16", question: "Have you noticed any changes in your bladder control, such as sudden urges to urinate?", validator: (x) => x.length > 0 },
        { key: "Q17", question: "If you have a blood pressure monitor at home, have you noticed any consistently high readings?", validator: (x) => x.length > 0 },
        { key: "Q18", question: "Is there anything else you'd like to share about how you're feeling that we haven't covered yet?", validator: (x) => x.length > 0 }
    ];

    const complication_questions_Peripheral_Neuropathy = [
        { key: "Q1", question: "If you're comfortable sharing, could you tell me how long it's been since you were diagnosed with peripheral neuropathy?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Do you have a routine for checking your feet each day for any changes or wounds?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q3", question: "Are you able to keep your feet moisturized regularly?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q4", question: "Has your doctor ever mentioned diabetes to you?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q5", question: "Have you noticed any changes in your feet, such as feeling warmer than usual, or looking red or swollen?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q6", question: "Have you experienced any deep, dull muscle pain, similar to a toothache or cramping sensation?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q7", question: "Have you felt any burning sensations or increased sensitivity to pain on your skin?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "Is there anything else you'd like to share about how you're feeling that we haven't covered yet?", validator: (x) => x.length > 0 }
    ]; 

    const disabilities_questions = [
        {key: "Cognition", question: [
            "Could you please tell me what year it is currently?",
            "Do you happen to know which season we're in right now?",
            "If you don't mind, could you share today's date with me?",
            "Would you be able to tell me what day of the week it is today?",
            "I was wondering if you could tell me which month we're in at the moment?",
            "If you're familiar with our location, could you tell me which state (or city/province) we're in?",
            "Would you mind sharing which country we're currently in?",
            "Do you happen to know which town (or district) we're in right now?",
            "If you're aware, could you tell me which hospital we're in at the moment?",
            "Do you know which floor we're on right now?",
            "I'm going to say three words, and I'd like you to repeat them after me, okay? The words are 'Airplane, Pencil, Tree'. Let's start with 'Airplane'. Could you repeat that for me?",
            "Great, now could you repeat 'Pencil' for me?",
            "And lastly, could you repeat 'Tree' for me?",
            "Now, I have a small math question for you. Could you tell me what you get when you subtract 7 from 100?",
            "Thank you. Now, could you subtract 7 from that number again and tell me what you get?",
            "Let's do that one more time. Could you subtract 7 again and share the result?",
            "We're almost done with this part. Could you subtract 7 one more time and tell me the answer?",
            "Last time for this exercise. Could you subtract 7 one final time and share what you get?",
            "Earlier, I mentioned three words to you. I'm wondering if you could recall them for me. Let's start with the first word. Do you remember if one of them was 'Airplane'?",
            "That's great. Do you recall if 'Pencil' was one of the words?",
            "And lastly, do you remember if 'Tree' was one of the words I mentioned?",
            "(While pointing to a wristwatch) Could you tell me what we call this object I'm pointing to?",
            "(While pointing to a pen) And what about this object? What do we usually call this?",
            "I'm going to ask you to follow a three-part instruction, okay? First, could you please take a piece of paper in your hand?",
            "Great, now could you fold that paper in half for me?",
            "And finally, would you mind placing that folded paper on the floor?",
            "I have a short phrase I'd like you to repeat after me. The phrase is 'No ifs, ands, or buts'. Could you try saying that for me?",
            "I'm going to show you a written instruction, and I'd like you to follow it, okay? The instruction says 'CLOSE YOUR EYES'. Could you do that for me?",
            "For this next task, I'd like you to write a sentence about how you're feeling today or what the weather is like. Would you be comfortable doing that?",
            "For this last task, I'm going to show you a design of two overlapping pentagons. Could you try to copy this design for me?"
        ]},
        {key: "UpperExtremity", question: [
            "I'd like you to write something with your non-dominant hand. Could you let me know how long it takes you to do this? Please put a minus sign in front of the time. This is part of the Jebsen Hand Function Test.",
            "Now, could you do the same thing with your dominant hand? Again, please put a minus sign in front of the time.",
            "For this next task, I'd like you to turn over a card with your non-dominant hand. Could you tell me how long this takes? Remember to put a minus sign in front of the time.",
            "Great, now could you do the same thing with your dominant hand? Don't forget to put a minus sign in front of the time.",
            "For this next test, which is part of the CUE-T test, could you tell me your score for the 'wrist up' movement?",
            "And what about your score for the 'push down' movement in the CUE-T test?",
            "Lastly for this part, could you share your score for the 'reach forward' movement in the CUE-T test?",
        ]},
        {key: "Movement", question: [
            "I'd like to assess your ankle movement. Could you try to flex your foot upwards from a relaxed position? This is part of the Motricity index test.",
            "Now, let's look at your knee movement. Starting with your knee bent at 90 degrees, could you try to extend your leg? This is also part of the Motricity index.",
            "For this next movement, could you try to flex your hip from a 90-degree position? This is the last part of the Motricity index we'll do.",
            "Finally, I'd like you to do a walking test. Could you walk for 10 meters at your comfortable pace? I'll time how long it takes you."
        ]},
    ];

    const disabilities_descriptions=[
        {key: "Cognition", question: (
            <>
                (Cognition tests) <br />
                I'd like to explain a test we use called the Mini-Mental State Examination, or MMSE for short. It's a tool we often use to check cognitive functions, like memory and attention. <br />
                The test involves some simple tasks, such as remembering words, following instructions, and doing some basic math. Don't worry, it's not difficult, and there's no pass or fail. <br />
                If you're interested, there's a video below that explains it in more detail. Would you like to watch it? <br />
                <YouTubeEmbed videoId="y39BDAljIbg" /><br />
            </>
        )},
        {key: "UpperExtremity", question: (
            <>
                (Upper Extremity tests) <br />
                We have two tests that help us understand how well you can use your hands and arms. The first one is called the Jebsen Hand Function Test. It's a simple way for us to see how your hands work with everyday tasks. <br />
                If you'd like, you can watch this video that shows how it's done: <br />
                <YouTubeEmbed videoId="CIbTv0I4CYg" /><br />
                The second test is called CUE-T. It helps us see how well you can move your upper body. <br />
                (1) Wrist up: Curl your wrist up as high as possible and then lower it all the way down. <br />
                Keep your arm on the arm rest. Do that as many times as you can in 30 seconds. See the photo below. <br />
                <img src={cue_t_photo_1} alt="CT Photo 1" style={{ width: '300px', height: '225px', borderRadius: '10px' }} /><br />
                (2) Push down: Use your arms to raise your body off the seat and hold yourself up as long as you can. <br />
                Try to stay up for 30 seconds. See the photo below. <br />
                <img src={cue_t_photo_2} alt="CT Photo 2" style={{ width: '300px', height: '225px', borderRadius: '10px' }} /><br />
                (3) Reach forward: Reach out and touch the round marker with you right(left) hand and return your hand to your lap. <br />
                Do not lean forward. Keep your back against the back of the chair. <br />
                Do that as many times as you can in 30 seconds. See the photo below. <br />
                <img src={cue_t_photo_3} alt="CT Photo 3" style={{ width: '300px', height: '225px', borderRadius: '10px' }} /><br />
            </>
        )},
        {key: "Movement", question: (
            <>
                (Movement tests) <br />
                Let's talk about two simple tests we'd like to do with you today to understand your movement better. <br />
                The first one is called the Motricity Index. It's a gentle way for us to see how strong your arms and legs are. We'll look at how you move certain parts of your body. Don't worry, it's not difficult at all. If you'd like to see how it's done, there's a helpful video right here: <br />
                <YouTubeEmbed videoId="Srxg_84qkVk" /><br />
                The second test is called the 10-meter walking test. It's a really easy way for us to see how you walk. We're just interested in your natural, comfortable walking pace. There's no need to rush. If you're curious about how this works, you can watch this short video: <br />
                <YouTubeEmbed videoId="jKZcQM5PGq8" /><br />
                Remember, these tests are just to help us understand how we can best support you. There's no right or wrong way to do them. We're just happy you're here with us today.
            </>
        )}
    ];

    const [editIndex, setEditIndex] = useState(null);

    const handleRevise = (index) => {
        setInput(messages[index].text);
        setEditIndex(index);
    };

    const herokulink =""; //"https://reconect-ef4dd30ce7be.herokuapp.com"
    const sendMessage = async () => {
        try {
            let response;
            if (editIndex !== null) {
                const updatedMessages = messages.map((msg, idx) => 
                    idx === editIndex ? { ...msg, text: input } : msg
                );
                setMessages(updatedMessages);
                setEditIndex(null);
                setInput('');
                return;
            }
            if (currentStep === 'initial') {
                if (input.toLowerCase() === 'no') {       
                    setCurrentStep('checkif_new_patient');
                } else if (input.toLowerCase() === 'yes') {
                    setCurrentStep('R_checkif_new_patient');
                }
                setMessages([...messages, { text: "Got it! Is this your first time using our service? (yes/no)", user: false }]);
            }
            if (currentStep === 'checkif_new_patient') {
                if (input.toLowerCase() === 'yes') {
                    setCurrentStep('new_patient');
                    setMessages([...messages, { text: "Press Enter or Send button to register. ", user: false }]);
                } else if (input.toLowerCase() === 'no') {
                    setCurrentStep('not_new_patient');
                    setMessages([...messages, { text: "Press Enter or Send button for login.", user: false }]);
                }
            }
            if (currentStep === 'new_patient') {
                const patient_info_temp = [];
                const temp_1 = prompt(`Enter New ID (8-digits number): `);
                patient_info_temp.push(temp_1);
                const temp_2 = prompt(`Enter New Password (6-digits number): `);
                patient_info_temp.push(temp_2);
                response = await axios.post(`${herokulink}/exist_id`, { patientinfo: patient_info_temp });
                if (response.data.exist_id) {
                    setCurrentStep('new_patient');
                    setMessages([...messages, { text: "ID already exists. Enter different 8-digits number. Press Enter or Send button to register again:", user: false }]);                        
                } else {
                    setID(temp_1);
                    setPassword(temp_2);
                    setCurrentStep('userInput');

                    setMessages([...messages, { text: "Registered! \nI’m here to help. Could you tell me what’s bothering you the most?  It’ll take about 30 minutes to figure things out and see if you might need a hospital visit.", user: false }]);
                }
            }
            if (currentStep === 'not_new_patient') {
                const patient_info_temp = [];
                const temp_1 = prompt(`Enter ID (8-digits number): `);
                patient_info_temp.push(temp_1);
                const temp_2 = prompt(`Enter Password (6-digits number): `);
                patient_info_temp.push(temp_2);
                response = await axios.post(`${herokulink}/valid_id`, { patientinfo: patient_info_temp });
                if (!response.data.valid_id) {
                    setCurrentStep('not_new_patient');
                    setMessages([...messages, { text: "Invalid Password. Press Enter or Send button to try again.", user: false }]);                        
                } else if (!response.data.valid_password) {
                    setCurrentStep('not_new_patient');
                    setMessages([...messages, { text: "Invalid ID. Press Enter or Send button to try again.", user: false }]);                        
                } else {
                    setID(temp_1);
                    setPassword(temp_2);
                    setCurrentStep('awaitingExistingInfoResponse');
                    setMessages([...messages, { text: "Found existing patient information. Would you like to use it? (yes/no) ", user: false }]);
                }
            }
            if (currentStep === 'awaitingExistingInfoResponse') {
                if (input.toLowerCase() === 'yes') {
                    response = await axios.post(`${herokulink}/use_existing_info`, {ID: ID, Password: Password});
                        setMessages([...messages, { text: input, user: true },{ text: response.data.diagnosis, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                    setCurrentStep('complete');
                } else if (input.toLowerCase() === 'no') {
                    setCurrentStep('userInput');
                    setMessages([...messages, { text: "I’m here to help. Could you tell me what’s bothering you the most?  It’ll take about 30 minutes to figure things out and see if you might need a hospital visit.", user: false }]);
                }             
            } 
            if (currentStep === 'userInput') {
                try {
                    console.log("Current input:", input); // Log the current input
                    response = await axios.post(`${herokulink}/LLM`, { input_text: input });
                    const classifiedPain = response.data.result;
                    console.log("Classified pain:", classifiedPain); // Log the result of classifyPain
                                
                    if (classifiedPain.toLowerCase().includes(',')) {
                        setCurrentStep('userInput');
                        setMessages([...messages, { text: `Among ${classifiedPain}, which one is the most important? `, user: false }]);
                    } else if (classifiedPain.toLowerCase().includes('lower extremity pain')) {
                        setCurrentStep('userInput_Lower_Extremity');
                        setMessages([...messages, { text: "Type 'y' and Send button to proceed. ", user: false }]);
                    } else if (classifiedPain.toLowerCase().includes('upper extremity pain')) {
                        setCurrentStep('userInput_Upper_Extremity');
                        setMessages([...messages, { text: "Type 'y' and Send button to proceed. ", user: false }]);
                    } else if (classifiedPain.toLowerCase().includes('back pain')) {
                        setCurrentStep('userInput_Low_Back_Pain');
                        setMessages([...messages, { text: "Type 'y' and Send button to proceed. ", user: false }]);
                    } else if (classifiedPain.toLowerCase().includes('neck pain')) {
                        setCurrentStep('userInput_Neck_Pain');
                        setMessages([...messages, { text: "Type 'y' and Send button to proceed. ", user: false }]);
                    } else {
                        setMessages([...messages, { text: "I couldn't classify your pain. Please try describing it differently.", user: false }]);
                        return; // Exit the function early to avoid showing the "Press Enter or Send button to proceed" message
                    }
                } catch (error) {
                    console.error("Error classifying pain:", error);
                    setMessages([...messages, { text: "An error occurred while processing your input. Please try again.", user: false }]);
                }
            }
            if (currentStep.startsWith('userInput_')) {
                const questionMap = {
                    'userInput_Lower_Extremity': questions_Lower_Extremity,
                    'userInput_Upper_Extremity': questions_Upper_Extremity,
                    'userInput_Low_Back_Pain': questions_Low_Back_Pain,
                    'userInput_Neck_Pain': questions_Neck_Pain
                };
                
                const questions = questionMap[currentStep];
                const currentQuestion = questions[Object.keys(patientInfo).length];
                
                if (currentQuestion.validator(input)) {
                    const newPatientInfo = { ...patientInfo, [currentQuestion.key]: input };
                    setPatientInfo(newPatientInfo);
                    if (Object.keys(newPatientInfo).length === questions.length) {
                        response = await axios.post(`${herokulink}/user_input`, { 'patient_info': newPatientInfo, 'ID': ID, 'Password': Password});
                            setMessages([...messages, { text: input, user: true },{ text: response.data.diagnosis, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                        setCurrentStep('complete');
                    } else {
                        setMessages([...messages, { text: input, user: true }, { text: questions[Object.keys(newPatientInfo).length].question, user: false }]);
                    }
                } else {
                    setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
                }
            }
            ///////////////////////
            if (currentStep === 'R_checkif_new_patient') {
                if (input.toLowerCase() === 'yes') {
                    setCurrentStep('R_new_patient');
                    setMessages([...messages, { text: "Press Enter or Send button to register. ", user: false }]);
                } else if (input.toLowerCase() === 'no') {
                    setCurrentStep('R_not_new_patient');
                    setMessages([...messages, { text: "Press Enter or Send button for login.", user: false }]);
                }
            }
            if (currentStep === 'R_new_patient') {
                const patient_info_temp = [];
                const temp_1 = prompt(`Enter New ID (8-digits number): `);
                patient_info_temp.push(temp_1);
                const temp_2 = prompt(`Enter New Password (6-digits number): `);
                patient_info_temp.push(temp_2);
                response = await axios.post(`${herokulink}/R_exist_id`, { patientinfo: patient_info_temp });
                if (response.data.exist_id) {
                    setCurrentStep('R_new_patient');
                    setMessages([...messages, { text: "ID already exists. Enter different 8-digits number. Press Enter or Send button to register again:", user: false }]);                        
                } else {
                    setID(temp_1);
                    setPassword(temp_2);
                    setCurrentStep('File_not_exists');
                    setMessages([...messages, { text: "No existing patient info found for "+ ID+". Press Enter or Send button to write new Patient info.", user: false }]);
                }
            }
            if (currentStep === 'R_not_new_patient') {
                const patient_info_temp = [];
                const temp_1 = prompt(`Enter ID (8-digits number): `);
                patient_info_temp.push(temp_1);
                const temp_2 = prompt(`Enter Password (6-digits number): `);
                patient_info_temp.push(temp_2);
                response = await axios.post(`${herokulink}/R_valid_id`, { patientinfo: patient_info_temp });
                if (!response.data.valid_id) {
                    setCurrentStep('R_not_new_patient');
                    setMessages([...messages, { text: "Invalid ID. Press Enter or Send button to try again.", user: false }]);                        
                } else if (!response.data.valid_password) {
                    setCurrentStep('R_not_new_patient');
                    setMessages([...messages, { text: "Invalid Password. Press Enter or Send button to try again.", user: false }]);                        
                } else {
                    setID(temp_1);
                    setPassword(temp_2);
                    setCurrentStep('File_exists');
                    setMessages([...messages, { text: "Loaded patient information for "+ ID+" from existing file. Would you like to use past diagnosis and disabilities?", user: false }]);
                }
            }
            if (currentStep === 'File_exists') {
                if (input.toLowerCase() === 'yes') {
                    response = await axios.post(`${herokulink}/File_exists`, {'diagnosis_id': ID,'Password': Password});
                    setDiagnosis(response.data.diagnosis);
                    setDisabilities(response.data.disabilities);
                    if (response.data.empty_disabilities.length===0) {
                        setCurrentStep('Compare_item_scores');
                    } else {
                        setEmptyDisabilities(response.data.empty_disabilities);
                        setCurrentStep('Get_item_scores_temp');
                    }
                    setMessages([...messages, { text: input, user: true },{ text: response.data.result_str, user: false }]);
                } else {
                    setCurrentStep('File_not_exists');
                    setMessages([...messages, { text: input, user: true },{ text: "Press Enter or Send button to write new Patient info.", user: false }]);
                }       
            }
            if (currentStep === 'File_not_exists') {
                const patient_info_temp = [];
                const temp_1 = prompt(`Enter Diagnosis: `);
                patient_info_temp.push(temp_1);
                const temp_2 = prompt(`Enter disability (Tell me what’s bothering you the most among cognition, upper extremity, or movement. You can select multiple options): `);
                patient_info_temp.push(temp_2);

                response = await axios.post(`${herokulink}/Update_patient_info`, { 'patient_info': patient_info_temp, 'diagnosis_id': ID, 'Password': Password})
                setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false },{ text: "Would you like to move forward with these diagnoses and disabilities? It should take about 30 minutes to guide you on management and determine if a follow-up visit with your physician is needed.", user: false }]);
                setCurrentStep('File_exists');  
            }
            if (currentStep === 'Compare_item_scores') {
                response = await axios.post(`${herokulink}/Input_item_scores`, { 'diagnosis_id': ID, 'Password': Password});
                setDecreased_items(response.data.decreased_items);    
                if (Array.isArray(decreased_items) && decreased_items.every(item => item === "")) {
                    setCurrentStep('ComplicationsInput_temp')
                    setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false },{ text: "Now let me screen possible complications.\n(Q1)\nDoctor: How long has it been since you were diagnosed with stroke?\nPatient: ", user: false }]);
                } else {
                    setCurrentStep('RehabTraining')
                    setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false },{ text: "Press Enter or Send button to see rehabilitation training for decreased items.", user: false }]);
                }
            }
            if (currentStep === 'Get_item_scores_temp') {
                emptyDisabilities.forEach(disability => {
                    setMessages(prevMessages => [
                        ...prevMessages, 
                        { text: disabilities_descriptions.find(q => q.key === disability).question, user: false }
                    ]);
                });
                setMessages(prevMessages => [
                    ...prevMessages, 
                    { text: "Press Enter or Send button to proceed", user: false }
                ]);
                setCurrentStep('Get_item_scores');
            }
            if (currentStep ==='Get_item_scores') {
                const answers =[];
                let answer =[];
                let temp ="";
                for (let j=0; j < emptyDisabilities.length; j++){
                    for (let i = 0; i < disabilities_questions.find(q => q.key === emptyDisabilities[j]).question.length; i++) {
                        while (true) {
                            try {
                                temp = prompt(disabilities_questions.find(q => q.key === emptyDisabilities[j]).question[i]);
                                if (!temp) throw new Error("Invalid input");
                                break;
                            } catch (error) {
                                alert("Please enter a valid input.");
                            }
                        }
                        answer.push(temp);
                        temp ="";
                    }
                    answers.push(answer);
                    answer =[];
                }
                response = await axios.post(`${herokulink}/Get_item_scores`, { 'emptyDisabilities': emptyDisabilities, 'answers': answers, 'diagnosis_id': ID})
                setCurrentStep('Compare_item_scores');
                setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false },{ text: "Press Enter or Send button to compare today's score with last 7-day's score.", user: false }]);
            }
            if (currentStep === 'RehabTraining') {
                response =await axios.post(`${herokulink}/Get_rehabilitation_evaluation`, { 'decreased_items': decreased_items, 'disabilities': disabilities})
                setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false },{ text: "Now let me screen possible complications. Press Enter or Send button to proceed.", user: false }]);
                setCurrentStep('ComplicationsInput_temp');                
            }
            if (currentStep === 'ComplicationsInput_temp') {
                if (diagnosis=== "Traumatic Brain Injury"){
                    setCurrentStep('ComplicationsInput_TBI');
                    setMessages([...messages, { text: "\n(Q1)\nDoctor: How long has it been since you were diagnosed with traumatic brain injury?\nPatient:", user: false }]);
                } else if (diagnosis=== "Stroke"){
                    setCurrentStep('ComplicationsInput_Stroke');
                    setMessages([...messages, { text: "\n(Q1)\nDoctor: How long has it been since you were diagnosed with stroke?\nPatient:", user: false }]);
                } else if (diagnosis=== "Parkinsons Disease"){
                    setCurrentStep('ComplicationsInput_PD');
                    setMessages([...messages, { text: "\n(Q1)\nDoctor: How long has it been since you were diagnosed with Parkinson's disease?\nPatient:", user: false }]);
                } else if (diagnosis=== "Spinal Cord Injury"){
                    setCurrentStep('ComplicationsInput_SCI');
                    setMessages([...messages, { text: "\n(Q1)\nDoctor: How long has it been since you were diagnosed with spinal cord injury?\nPatient:", user: false }]);
                } else if (diagnosis=== "ALS"){
                    setCurrentStep('ComplicationsInput_ALS');
                    setMessages([...messages, { text: "\n(Q1)\nDoctor: How long has it been since you were diagnosed with ALS?\nPatient:", user: false }]);
                } else if (diagnosis=== "Peripheral Neuropathy"){
                    setCurrentStep('ComplicationsInput_PN');
                    setMessages([...messages, { text: "\n(Q1)\nDoctor: How long has it been since you were diagnosed with peripheral neuropathy?\nPatient:", user: false }]);
                }
            }
            if (currentStep.startsWith('ComplicationsInput_')) {
                const diagnosisMap = {
                    'ComplicationsInput_TBI': { questions: complication_questions_Traumatic_Brain_Injury, diagnosis: 'Traumatic Brain Injury' },
                    'ComplicationsInput_Stroke': { questions: complication_questions_Stroke, diagnosis: 'Stroke' },
                    'ComplicationsInput_PD': { questions: complication_questions_Parkinsons_Disease, diagnosis: 'Parkinsons Disease' },
                    'ComplicationsInput_SCI': { questions: complication_questions_Spinal_Cord_Injury, diagnosis: 'Spinal Cord Injury' },
                    'ComplicationsInput_ALS': { questions: complication_questions_ALS, diagnosis: 'ALS' },
                    'ComplicationsInput_PN': { questions: complication_questions_Peripheral_Neuropathy, diagnosis: 'Peripheral Neuropathy' }
                };

                const { questions, diagnosis } = diagnosisMap[currentStep];
                const currentQuestion = questions[Object.keys(patientInfo).length];

                if (currentQuestion.validator(input)) {
                    const newPatientInfo = { ...patientInfo, [currentQuestion.key]: input };
                    setPatientInfo(newPatientInfo);
                    if (Object.keys(newPatientInfo).length === questions.length) {
                        response = await axios.post(`${herokulink}/complications_input`, { patient_info: newPatientInfo, diagnosis: diagnosis });
                        setMessages([...messages, { text: input, user: true },{ text: response.data.diagnosis, user: false },{ text: "Would you like to save today’s conversation for future reference? Your data will be securely stored and protected, and can only be accessed with your ID and password, following industry-standard data protection regulations.", user: false }]);
                        setCurrentStep('send_Results');
                    } else {
                        setMessages([...messages, { text: input, user: true }, { text: questions[Object.keys(newPatientInfo).length].question, user: false }]);
                    }
                } else {
                    setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
                }
            }
            if (currentStep ==='send_Results'){
                if (input.toLowerCase() === 'yes'){
                    setCurrentStep('complete');
                    setMessages([...messages, { text: input, user: true },{ text: "Results sent to the patient. Press Enter or Send button to restart.", user: false }]);
                } else if (input.toLowerCase() === 'no'){
                    setCurrentStep('complete');
                    setMessages([...messages, { text: input, user: true },{ text: "Results discarded. Press Enter or Send button to restart", user: false }]);
                }
            }
            if (currentStep === 'complete') {
                // Resetting the state to start over
                setMessages([]);
                setInput('');
                setCurrentStep('initial');
                setPatientInfo({});
            }
            setInput('');
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const renderMessageText = (text) => {
        if (typeof text === 'string') {
            return text.split('\n').map((item, index) => (
                <React.Fragment key={index}>
                    {item}
                    <br />
                </React.Fragment>
            ));
        }
        return text;
    };
    return (
        <ChatContainer>
            {currentStep === 'initial' && messages.length === 0 && (
                <div>Welcome! Before we get started, have you had a recent diagnostic assessment done by a healthcare professional? (yes/no)</div>
            )}
            <MessageContainer>
                {messages.map((message, index) => (
                    <MessageWrapper key={index} user={message.user}>
                        {message.user ? (
                            <>
                                <StyledButton onClick={() => handleRevise(index)}>Revise</StyledButton>
                                <UserMessage>{renderMessageText(message.text)}</UserMessage>
                            </>
                        ) : (
                <BotMessage>{renderMessageText(message.text)}</BotMessage>
            )}
                    </MessageWrapper>
                ))}
            </MessageContainer>  
            <InputContainer>
                <ChatInput
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                />
                <SendButton onClick={sendMessage}>Send</SendButton>
            </InputContainer>
        </ChatContainer>
    );
}

export default Chatbot_v2;
