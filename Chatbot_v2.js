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

const UserMessage = styled.div`
  align-self: flex-end;
  background: #6a5acd;
  color: white;
  padding: 10px 15px;
  border-radius: 15px;
  max-width: 60%;
  word-wrap: break-word;
  text-align: right;
`;

const BotMessage = styled.div`
  align-self: flex-start;
  background: #e8eaf6;
  color: #333;
  padding: 10px 15px;
  border-radius: 15px;
  max-width: 60%;
  word-wrap: break-word;
  text-align: left;
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
  margin-left: 10px;
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
                <img src={lower_extremity_photo_1} alt="LE Photo 1" style={{ width: '120px', height: 'auto' }} />
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
                <iframe src={`https://www.youtube.com/embed/Nvc7YsxdD28`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: "If I were to gently press on the area that's sore, would it be painful?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: (
            <>
                Now, I'd like you to try another test called the Pace maneuver. Could you follow the instructions in this video and tell me if you feel any pain? See Video 2 for instructions.<br />
                <iframe src={`https://www.youtube.com/embed/WhuPgPx4GtM`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q32", question: (
            <>
                Let's try one more test called the Lachman test. Could you watch this video and try the movement? Let me know if you feel any pain or unusual movement. See Video 3 for instructions.<br />
                <iframe src={`https://www.youtube.com/embed/gfN-p-xZx24`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q33", question: (
            <>
                Now we'll do something called the Reverse Lachman test. Could you follow the instructions in this video and tell me what you feel? See Video 4 for instructions.<br />
                <iframe src={`https://www.youtube.com/embed/sXlW2lPXf4s`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q34", question: (
            <>
                Let's try the Valgus stress test. Could you watch this video and try the movement? Please let me know if you feel any pain or instability. See Video 5 for instructions.<br />
                <iframe src={`https://www.youtube.com/embed/ys8JxW79m2E`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q35", question: (
            <>
                Lastly, we'll do the McMurray test. Could you follow the instructions in this video and tell me if you feel or hear anything unusual? See Video 6 for instructions.<br />
                <iframe src={`https://www.youtube.com/embed/nqp7PwEj0Es`}></iframe>
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
                <img src={upper_extremity_photo_1} alt="UE Photo 1" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q15", question: "Do you hear any friction or rubbing sounds when you bend or straighten your wrist?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "Have you noticed that your wrist doesn't move as freely as it used to?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "Have you ever felt like your wrist gets stuck or catches when you move it?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: (
            <>
                Do you find it difficult to straighten this joint in your finger? See Photo 2.<br />
                <img src={upper_extremity_photo_2} alt="UE Photo 2" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: (
            <>
                Is it hard to straighten the tip of your finger? See Photo 2.<br />
                <img src={upper_extremity_photo_2} alt="UE Photo 2" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "Do you have trouble bending the tip of your finger?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: (
            <>
                When you bend your fingers, do they ever get stuck or snap like in this video? See Video 1.<br />
                <iframe src={`https://www.youtube.com/embed/8hq9K96rM1c`}></iframe>
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
                <iframe src={`https://www.youtube.com/embed/R3xJDsJ_Nw4`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q28", question: "Have you had any recent injuries in the area where you're feeling pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q29", question: "Does the pain get worse when you grip something tightly?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: (
            <>
                When you bend your wrist or turn your palm down like this, does it hurt more? See Photo 3.<br />
                <img src={upper_extremity_photo_3} alt="UE Photo 3" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: (
            <>
                Do you feel pain in this area when you bend your elbow or throw something? See Photo 4.<br />
                <img src={upper_extremity_photo_4} alt="UE Photo 4" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q32", question: (
            <>
                When you lift heavy objects, do you feel pain in this area? See Photo 4.<br />
                <img src={upper_extremity_photo_4} alt="UE Photo 4" style={{ width: '120px', height: 'auto' }} />
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
                <img src={upper_extremity_photo_5} alt="UE Photo 5" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q44", question: (
            <>
                When someone else moves your shoulder, can you move it further than when you try to move it yourself? See Video 3 and 4.<br />
                <iframe src={`https://www.youtube.com/embed/cP4LLJie9kw`}></iframe><br />
                <iframe src={`https://www.youtube.com/embed/n9HQIw1LHDY`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q45", question: (
            <>
                Compared to your healthy shoulder, is it harder to move your affected shoulder in all directions? See Video 3 and 4.<br />
                <iframe src={`https://www.youtube.com/embed/cP4LLJie9kw`}></iframe><br />
                <iframe src={`https://www.youtube.com/embed/n9HQIw1LHDY`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q46", question: (
            <>
                Is it difficult to move your shoulder both when you try to move it and when someone else moves it for you? See Video 3 and 4.<br />
                <iframe src={`https://www.youtube.com/embed/cP4LLJie9kw`}></iframe><br />
                <iframe src={`https://www.youtube.com/embed/n9HQIw1LHDY`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q47", question: (
            <>
                Compared to your healthy shoulder, is it harder to move your affected shoulder in certain directions? See Video 3 and 4.<br />
                <iframe src={`https://www.youtube.com/embed/cP4LLJie9kw`}></iframe><br />
                <iframe src={`https://www.youtube.com/embed/n9HQIw1LHDY`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q48", question: (
            <>
                Does it hurt when I gently press here or around this area? See Video 5.<br />
                <iframe src={`https://www.youtube.com/embed/U31quA3ZsjY&t=104s`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q49", question: "Does your neck feel sore when I gently touch it?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q50", question: "Have you noticed any swelling or a lump around your shoulder?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q51", question: "Is the area around your shoulder red or warm to the touch?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q52", question: (
            <>
                Does it hurt when I gently press this part of your elbow? See Photo 6.<br />
                <img src={upper_extremity_photo_6} alt="UE Photo 6" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q53", question: "Is it painful when I lightly touch this inner part of your elbow?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q54", question: "Are there bruising, swelling, or redness at the cubital fossa?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q55", question: (
            <>
                Can you observe a deformed shape which is known as Popeye's belly around biceps when bending your elbow? See Photo 7.<br />
                <img src={upper_extremity_photo_7} alt="UE Photo 7" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q56", question: "Is there tenderness around the triceps tendon?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q57", question: "Is there redness, bruising or swelling at the triceps tendon insertion site?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q58", question: (
            <>
                Is there redness, heat sense or swelling at the olecranon? See Photo 8.<br />
                <img src={upper_extremity_photo_8} alt="UE Photo 8" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q59", question: "Is the elbow both tender and swollen?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q60", question: "Is there localized swelling or tenderness at the ulnar side or back of the wrist?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q61", question: "Is there tenderness at the radial side of the wrist?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q62", question: (
            <>
                Is the result of Finkelstein test positive? See Video 6.<br />
                <iframe src={`https://www.youtube.com/embed/Dm-_pumHt9c`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q63", question: (
            <>
                Is there tenderness around extensor carpi ulnaris tendon? See Photo 9.<br />
                <img src={upper_extremity_photo_9} alt="UE Photo 9" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q64", question: "Is there tenderness at the dorsal side of the wrist?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q65", question: (
            <>
                Is there swelling or bruising at the anatomical snuffbox? See Photo 10.<br />
                <img src={upper_extremity_photo_10} alt="UE Photo 10" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q66", question: "Is there tenderness, localized swelling or bruising at the distal radial side of the forearm?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q67", question: (
            <>
                Is there tenderness at the lunate? See Photo 11.<br />
                <img src={upper_extremity_photo_11} alt="UE Photo 11" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q68", question: "Do you experience tenderness when palpating the hollow area at the back of your wrist (distal to the radial styloid process, between the flexor carpi ulnaris tendon and the extensor carpi ulnaris tendon)?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q69", question: "Is there tenderness at the back (dorsal side) of the finger?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q70", question: "Is it impossible to extend proximal interphalangeal joint of the finger actively but possible to extend passively?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q71", question: "Is there redness, bruising, or swelling at the back (dorsal side) of the distal interphalangeal joint of the finger?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q72", question: (
            <>
                Is there tenderness at the ulnar collateral ligament of the thumb? See Photo 12.<br />
                <img src={upper_extremity_photo_12} alt="UE Photo 12" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q73", question: "Is there tenderness at the ulnar or radial side in any of the interphalangeal joints of the fingers?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q74", question: (
            <>
                Is there tenderness or nodule around A1 pulley of a finger? See Photo 13.<br />
                <img src={upper_extremity_photo_13} alt="UE Photo 13" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q75", question: "Is Bakody's sign positive?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q76", question: "How old are you?", validator: (x) => x.length > 0 }
    ];

    const questions_Low_Back_Pain = [
        { key: "patient_chief_complaint", question: "What is your chief complaint?", validator: (x) => x.length > 0 },
        { key: "Q1", question: "When did the symptom start?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Did the pain start suddenly, or did it develop gradually?", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Where does it hurt? Multiple choices are possible among central, peripheral part of the back.", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Specify the direction of the painful site. Possible choices are right, left, or both.", validator: (x) => x.length > 0 },
        { key: "Q5", question: "If the pain radiates to different areas, tell me the areas. Examples are thigh, calf, or foot.", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Is there pain in perineal area or buttock?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q7", question: "Has the level of pain remained consistent since it first started, or has it fluctuated, with periods of improvement and worsening?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "Have you experienced the same type of pain before?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q9", question: "How severe is the pain on a scale of 0 to 10?", validator: (x) => x.length > 0 },
        { key: "Q10", question: "Did you unintentionally lose your weight recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q11", question: "Have you had fever (possibly indicating infection) recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q12", question: "Have you experienced any recent difficulties with bowel movements or urination?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "Is there persistent leg weakness or walking (gait) disturbance?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q14", question: "Is there back stiffness in the morning?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q15", question: "Is there pain in other joints?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "Have you noticed any changes in the skin color on your toes?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "Do you have a rash on your legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: "Have you recently had issues like eye inflammation (iritis), skin rashes, diarrhea, or discharge from the urethra?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: "Does back pain and radiating pain toward the legs worsen when bending over?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "Does the pain subside when lying down and aggravate when standing up?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: "Does the pain remain consistent regardless of the posture such as sitting, lying down?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "Does the pain occur when you straighten your back after bending over, or when you cough or sneeze?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "Does the pain occur when you stand up for an extended period, or when you walk?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q24", question: "How old are you?", validator: (x) => x.length > 0 },
        { key: "Q25", question: "When walking for a long time, do you experience pain in both legs or in one hip, and does bending your back relieve the pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q26", question: "Does the pain subside when doing exercise?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q27", question: "Does the pain linger even after rest?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q28", question: "Does the pain worsen during the night?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q29", question: "Have you recently had any serious accidents such as traffic accidents, fall?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: "Are you a cancer patient?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: "Have you taken oral steroids recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q32", question: "Have you recently had drug abuse?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q33", question: "Are you infected to HIV or currently in a state of weakened immune function?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q34", question: "Is there a noticeable difference in muscle size (atrophy) between both of your legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q35", question: (
            <>
                Does the forward curve in your lower back (lumbar lordosis) stay the same whether you are sitting or standing? See Photo 1.<br />
                <img src={low_back_pain_photo_1} alt="LBP Photo 1" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q36", question: (
            <>
                Does the forward curve in your lower back (lumbar lordosis) disappear while you walk? See Photo 1.<br />
                <img src={low_back_pain_photo_1} alt="LBP Photo 1" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },     
        { key: "Q37", question: "Is there any sign of sideways curvature of the spine (scoliosis)?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q38", question: "When you walk, do your toes drag on the ground or do you lift your knees high to prevent them from dragging?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q39", question: (
            <>
                Is Schober Test positive? See Video 1.<br />
                <iframe src={`https://www.youtube.com/embed/e2aRRkuS7eg`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },     
        { key: "Q40", question: "During the Schober test, did the pain worsen when you bent forward?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q41", question: "Did the pain worsen when you straightened your back during the Schober test?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q42", question: (
            <>
                Are you able to raise both legs more than 60 degrees during Straight Leg Raise? See Video 2.<br />
                <iframe src={`https://www.youtube.com/embed/RKs1grlLDpU`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },  
        { key: "Q43", question: "Press on different areas of the lower back. Does the patient complain of widespread tenderness or tenderness even when pressing softly?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q44", question: "What is your gender? Possible choices are male and female.", validator: (x) => x.toLowerCase() === 'male' || x.toLowerCase() === 'female' }
    ];

    const questions_Neck_Pain = [
        { key: "patient_chief_complaint", question: "What is your chief complaint?", validator: (x) => x.length > 0 },
        { key: "Q1", question: "When did the symptom start?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Did the pain start abruptly or gradually?", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Which side does it hurt? Possible choices are front, back, lateral, or medial.", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Specify the direction of the painful site. Possible choices are right, left, or both.", validator: (x) => x.length > 0 },
        { key: "Q5", question: "If the pain radiates to different areas, tell me the areas. Examples are shoulder girdle, upper arm, forearm, fingers, or head.", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Do you feel pain on only one side of your head, or in areas like the back of your head, around your ears, jawbone, or cheekbone?", validator: (x) => x.length > 0 },
        { key: "Q7", question: "Is there persistent headache?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "Is the neck pain accompanied by severe arm pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q9", question: "Is there weakness or muscle getting thinner (atrophy) in arms or legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q10", question: "Is the weakness more severe in legs than in arms?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q11", question: "Do you have numbness or abnormal sensations in your arms or legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q12", question: "Have you recently experienced dizziness, vision problems, or ringing in your ears?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "How old are you?", validator: (x) => x.length > 0 },
        { key: "Q14", question: "What is your gender?", validator: (x) => x.toLowerCase() === 'female' || x.toLowerCase() === 'male' },
        { key: "Q15", question: "Does the pain worsen during coughing, sneezing, or doing Valsalva maneuver?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "Does the pain worsen when you tilt your head backward?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "Have you recently experienced trauma?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: "Did you fall from a height of more than 5 stairs or over 90 meters?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: "Did you injure your neck while diving?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "Were you rear-ended at a high speed (e.g. over 100 kilometers per hour), ejected from the vehicle during a car accident, or did the vehicle overturn?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: "Were you in a motorcycle or bicycle accident?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "Are you a patient with osteoporosis?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "Have you ever received corticosteroid treatment?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q24", question: "Are you a cancer patient?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q25", question: "Have you experienced unintentional weight loss recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q26", question: "Have you been receiving treatment for neck pain for over a month without any improvement?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q27", question: "Have you had any difficulties in bowel movement or urination?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q28", question: "Have you ever abused intravenous drugs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q29", question: "Have you previously had any neck surgeries?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: "Does the pain improve when you raise the arm of the affected side above your head (Bakody's sign)?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: (
            <>
                Is Hoffman's sign positive? See Video 1.<br />
                <iframe src={`https://www.youtube.com/embed/GJ-Q2ibYAHs`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q32", question: (
            <>
                Is Babinski's sign positive? See Video 2.<br />
                <iframe src={`https://www.youtube.com/embed/XMKEAm63SoM`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q33", question: (
            <>
                Is Spurling's Test positive? See Video 3.<br />
                <iframe src={`https://www.youtube.com/embed/h8GxF73P6GQ`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q34", question: (
            <>
                Is L'hermitte's sign positive? See Video 4.<br />
                <iframe src={`https://www.youtube.com/embed/mDQ-UdK-PDs`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q35", question: "Is there localized tenderness in lateral side of the neck?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q36", question: (
            <>
                Is there an increase in Knee Jerk Reflex? See Video 5.<br />
                <iframe src={`https://www.youtube.com/embed/K7FEm8JnV-s`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q37", question: "Do you have tenderness where the back of your head meets your neck?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q38", question: "Has your neck's range of motion decreased, or does it feel stiff when you move it?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }
    ];

    const complication_questions_Traumatic_Brain_Injury = [
        { key: "Q1", question: "How long has it been since you were diagnosed with traumatic brain injury?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Is there nausea, vomiting or drooping?", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Do you have persistent headache (In patients with communication difficulties, does the patient appear agitated or have any noticeable swelling)?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Do you have a stabbing or sharp, knife-like headache, or does your head hurt even when lightly touched?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "Are there difficulties in walking (gait disturbance), memory loss (dementia) or difficulties in voiding (urinary incontinence)?", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Are there fatigue, cold intolerance, depression, missing periods (amenorrhea), or problems with thinking or memory?", validator: (x) => x.length > 0 },
        { key: "Q7", question: "Have you recently experienced fever, high blood pressure, sweating, rapid breathing, a fast heartbeat, posture issues, or muscle stiffness?", validator: (x) => x.length > 0 },
        { key: "Q8", question: "Do you difficulties in breathing, sputum, or cough?", validator: (x) => x.length > 0 },
        { key: "Q9", question: "Have you noticed a loss of smell, blind spots that appear differently in each eye, or any decrease in vision?", validator: (x) => x.length > 0 },
        { key: "Q10", question: "Do your arms or legs feel stiff when you try to move them?", validator: (x) => x.length > 0 },
        { key: "Q11", question: "Do you have any joints that are swollen, warm, painful, or have limited movement? Commonly affected joints include the hip, elbow, shoulder, and knee.", validator: (x) => x.length > 0 },
        { key: "Q12", question: "Do you have insomnia, excessive sleep, or excessive daytime sleepiness?", validator: (x) => x.length > 0 },
        { key: "Q13", question: "Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.", validator: (x) => x.length > 0 }
    ];

    const complication_questions_Stroke = [
        { key: "Q1", question: "How long has it been since you were diagnosed with stroke?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Have you experienced new onset of decreased concentration, disorientation, memory loss, or language difficulties within a few days after the stroke, with these symptoms fluctuating between improvement and worsening?", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Have your arms or legs become stiffer than usual when you try to move them?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Do you experience choking while swallowing food, a change in your voice after eating, difficulty swallowing, or a feeling of food stuck in your throat?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "Is there shoulder pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q6", question: "Has your shoulder's range of motion, especially when rotating outward or lifting it to the side, decreased?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q7", question: "Have you recently noticed swelling, warmth, or 'pain during movement' in your wrist or hand?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "Have you developed pain in areas where you have numbness or tingling, such as your face or limbs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q9", question: "Do you have pain that gets worse with exercise and improves with rest?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q10", question: "Do you feel pain triggered by movement, touch, or changes in temperature (allodynia)?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q11", question: "Do you have constipation or difficulty holding your urine?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q12", question: "Do you experience persistent feelings of depression?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "Do you frequently experience anxiety?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q14", question: "Have you recently lost motivation in social activities or been participating less in rehabilitation programs than usual?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q15", question: "Have you had abrupt chest pain recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "Have you been lying in bed for more than three days, or do you have swelling or tenderness in your legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "Have you been coughing frequently, noticed a change in the color of your phlegm, or experienced shortness of breath recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: "Have you been waking up frequently during sleep or noticed that your snoring has become worse?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: "Have you experienced headache recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "Are you overweight (BMI>25)?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: "Do you feel drowsy during the day?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "Do you have trouble falling asleep or waking up in the middle of the night?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "Have you had any falls recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q24", question: (
            <>
                Do you experience double vision when looking at objects, or did you have any blind spots when you took the visual field test? See Video 1.<br />
                <iframe src={`https://www.youtube.com/embed/OodMJMPcITQ`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q25", question: "Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.", validator: (x) => x.length > 0 }
    ];

    const complication_questions_Parkinsons_Disease = [
        { key: "Q1", question: "How long has it been since you were diagnosed with Parkinson's Disease?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Are you currently taking levodopa?", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Do you recurrently experience shaking and times when you can't control your walking, feeling like your feet are stuck?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Do you recurrently feel pain, excessive sweating, a fast heartbeat, stomach discomfort, or experience feelings of depression or anxiety?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "Do you have uncontrollable movements that make it hard to sit, walk, or do everyday tasks?", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Have you recently experienced moments when you suddenly couldn't move (immobility)?", validator: (x) => x.length > 0 },
        { key: "Q7", question: "Was there an abrupt change in medication recently?", validator: (x) => x.length > 0 },
        { key: "Q8", question: "Have you had constipation recently?", validator: (x) => x.length > 0 },
        { key: "Q9", question: "Have you been sweating a lot recently or drinking less water recently (dehydration)?", validator: (x) => x.length > 0 },
        { key: "Q10", question: "Have you had any injuries recently?", validator: (x) => x.length > 0 },
        { key: "Q11", question: "Have you ever had slow movements along with a fast heartbeat or sweating?", validator: (x) => x.length > 0 },
        { key: "Q12", question: "Have you experienced any recent difficulties with bowel movements or urination?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "Is there persistent leg weakness or walking (gait) disturbance?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q14", question: "Is there back stiffness in the morning?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q15", question: "Is there pain in other joints?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "Have you noticed any changes in the skin color on your toes?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "Do you have a rash on your legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: "Have you recently had issues like eye inflammation (iritis), skin rashes, diarrhea, or discharge from the urethra?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: "Does back pain and radiating pain toward the legs worsen when bending over?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "Does the pain subside when lying down and aggravate when standing up?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: "Does the pain remain consistent regardless of the posture such as sitting, lying down?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "Does the pain occur when you straighten your back after bending over, or when you cough or sneeze?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "Does the pain occur when you stand up for an extended period, or when you walk?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q24", question: "How old are you?", validator: (x) => x.length > 0 },
        { key: "Q25", question: "When walking for a long time, do you experience pain in both legs or in one hip, and does bending your back relieve the pain?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q26", question: "Does the pain subside when doing exercise?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q27", question: "Does the pain linger even after rest?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q28", question: "Does the pain worsen during the night?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q29", question: "Have you recently had any serious accidents such as traffic accidents, fall?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: "Are you a cancer patient?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: "Have you taken oral steroids recently?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q32", question: "Have you recently had drug abuse?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q33", question: "Are you infected to HIV or currently in a state of weakened immune function?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q34", question: "Is there a noticeable difference in muscle size (atrophy) between both of your legs?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q35", question: (
            <>
                Does the forward curve in your lower back (lumbar lordosis) stay the same whether you are sitting or standing? See Photo 1.<br />
                <img src={low_back_pain_photo_1} alt="LBP Photo 1" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q36", question: (
            <>
                Does the forward curve in your lower back (lumbar lordosis) disappear while you walk? See Photo 1.<br />
                <img src={low_back_pain_photo_1} alt="LBP Photo 1" style={{ width: '120px', height: 'auto' }} />
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },     
        { key: "Q37", question: "Is there any sign of sideways curvature of the spine (scoliosis)?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q38", question: "When you walk, do your toes drag on the ground or do you lift your knees high to prevent them from dragging?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q39", question: (
            <>
                Is Schober Test positive? See Video 1.<br />
                <iframe src={`https://www.youtube.com/embed/e2aRRkuS7eg`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },     
        { key: "Q40", question: "During the Schober test, did the pain worsen when you bent forward?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q41", question: "Did the pain worsen when you straightened your back during the Schober test?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q42", question: (
            <>
                Are you able to raise both legs more than 60 degrees during Straight Leg Raise? See Video 2.<br />
                <iframe src={`https://www.youtube.com/embed/RKs1grlLDpU`}></iframe>
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },  
        { key: "Q43", question: "(To guardians) Press on different areas of the lower back. Does the patient complain of widespread tenderness or tenderness even when pressing softly?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q44", question: "What is your gender? Possible choices are male and female.", validator: (x) => x.toLowerCase() === 'male' || x.toLowerCase() === 'female' }
    ];

    const complication_questions_Spinal_Cord_Injury = [
        { key: "Q1", question: "How long has it been since you were diagnosed with a spinal cord injury?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Have you recently experienced a cough, changes in sputum color, shortness of breath, or fever?", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Have you recently had chest pain that worsens when you breathe?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Have you been waking up frequently during sleep or noticed that your snoring has become worse?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "Have you had dizziness, lightheadedness, pallor, yawning, weakness in muscles, fatigue or syncope?", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Have you had headache or sweating?", validator: (x) => x.length > 0 },
        { key: "Q7", question: "Have you had flushing or stuffy nose (nasal congestion)?", validator: (x) => x.length > 0 },
        { key: "Q8", question: "Have you had trouble emptying your bladder or issues with a blocked catheter?", validator: (x) => x.length > 0 },
        { key: "Q9", question: "Have you had sudden, uncontrolled urine leakage, leftover urine after voiding, leaks when you cough or sneeze, or trouble with constant dribbling of urine?", validator: (x) => x.length > 0 },
        { key: "Q10", question: "Have you had severe constipation?", validator: (x) => x.length > 0 },
        { key: "Q11", question: "Have you experienced bowel incontinence?", validator: (x) => x.length > 0 },
        { key: "Q12", question: "Have you had unusually tight muscles (hypertonus), sudden or ongoing uncontrolled muscle reflexes (hyperreflexia), shaking or jerking movements (clonus), or painful muscle spasms?", validator: (x) => x.length > 0 },
        { key: "Q13", question: "Have you had pain during walking or overusing arm or shoulder (for example while using a manually operated wheelchair)?", validator: (x) => x.length > 0 },
        { key: "Q14", question: "Have you experienced burning, aching, tingling or stabbing sensations?", validator: (x) => x.length > 0 },
        { key: "Q15", question: "Is there any damage to the skin or tissue over bony areas (bony prominence) like your hip, tailbone, or heel (ischium, trochanters, sacrum, heel)?", validator: (x) => x.length > 0 },
        { key: "Q16", question: "(To guardians) Has the patient experienced inadequate nutrition?", validator: (x) => x.length > 0 },
        { key: "Q17", question: "Did you feel pain while moving (transferring) from bed to chair?", validator: (x) => x.length > 0 },
        { key: "Q18", question: "Do you have tenderness around your knees?", validator: (x) => x.length > 0 },
        { key: "Q19", question: "Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.", validator: (x) => x.length > 0 }
    ];

    const complication_questions_ALS = [
        { key: "Q1", question: "How long has it been since you were diagnosed with ALS?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Is there excessive saliva production or drooling?", validator: (x) => x.length > 0 },
        { key: "Q3", question: "Is it difficult to cough up phlegm?", validator: (x) => x.length > 0 },
        { key: "Q4", question: "Is there inappropriate (disinhibited) laughing or crying, or signs of anxiety?", validator: (x) => x.length > 0 },
        { key: "Q5", question: "Have you had unusually tight muscles (hypertonus), sudden or ongoing uncontrolled muscle reflexes (hyperreflexia), shaking or jerking movements (clonus)?", validator: (x) => x.length > 0 },
        { key: "Q6", question: "Do you have muscle cramps that are bad enough to affect your daily activities or sleep?", validator: (x) => x.length > 0 },
        { key: "Q7", question: "Do you experience choking while swallowing food, a change in your voice after eating, difficulty swallowing, or a feeling of food stuck in your throat?", validator: (x) => x.length > 0 },
        { key: "Q8", question: "Do you feel short of breath even at rest, or does your breathing improve when sitting up?", validator: (x) => x.length > 0 },
        { key: "Q9", question: "Do you have sleep problems not caused by pain or mood issues, loss of appetite, morning headaches, daytime sleepiness, or trouble concentrating?", validator: (x) => x.length > 0 },
        { key: "Q10", question: "Have you felt down, lost interest in things you usually enjoy, lacked motivation, or become more easily irritated?", validator: (x) => x.length > 0 },
        { key: "Q11", question: "Have you felt tired, low on energy, easily worn out, sleepy, or less focused than usual (diminished alertness)?", validator: (x) => x.length > 0 },
        { key: "Q12", question: "(To guardians) Has the patient shown a lack of motivation (apathy), trouble controlling impulses (disinhibition), difficulty with planning or decision-making (executive dysfunction), or trouble finding the right words when speaking (reduced verbal fluency)?", validator: (x) => x.length > 0 },
        { key: "Q13", question: "Do you have difficulties in sleeping?", validator: (x) => x.length > 0 },
        { key: "Q14", question: "Have you had muscle or joint pain, especially in your neck or shoulder?", validator: (x) => x.length > 0 },
        { key: "Q15", question: "How old are you?", validator: (x) => x.length > 0 },
        { key: "Q16", question: "Have you had sudden, strong urges to urinate that sometimes lead to accidental leaks?", validator: (x) => x.length > 0 },
        { key: "Q17", question: "(If you have a blood pressure monitor) Have you measured your blood pressure two or more times, and was the systolic pressure always 140 mmHg or higher, or the diastolic pressure always 90 mmHg or higher?", validator: (x) => x.length > 0 },
        { key: "Q18", question: "Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.", validator: (x) => x.length > 0 }
    ];

    const complication_questions_Peripheral_Neuropathy = [
        { key: "Q1", question: "How long has it been since you were diagnosed with peripheral neuropathy?", validator: (x) => x.length > 0 },
        { key: "Q2", question: "Do you check your feet every day for any wounds?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q3", question: "Do you keep your feet well moisturized?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q4", question: "Do you have diabetes?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q5", question: "Are your feet warmer than usual, or do you notice any redness or swelling?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q6", question: "Have you felt a dull, deep muscle pain that feels like a toothache or cramping?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q7", question: "Have you felt a burning sensation or sensitivity to pain on the surface of your skin?", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.", validator: (x) => x.length > 0 }
    ]; 

    const disabilities_questions = [
        {key: "Cognition", question: [
            "What is the current year?",
            "What is the current season?",
            "What is the current date?",
            "What is the current day?",
            "What is the current month?",
            "Which state (city/province) are we in?",
            "Which country are we in?",
            "Which town (district) are we in?",
            "Which hospital are we in?",
            "Which floor are we at?",
            "Repeat the following 3 words: “Airplane, Pencil, Tree”.\n Repeated “Airplane”.",
            "Repeated “Pencil”.",
            "Repeated “Tree”.",
            "What is 100 minus 7?",
            "What do you get when you subtract 7 again?",
            "What do you get when you subtract 7 again?",
            "What do you get when you subtract 7 again?",
            "What do you get when you subtract 7 again?",
            "What were the 3 words that I said before? \n Recalled “Airplane”.",
            "Recalled “Pencil”.",
            "Recalled “Tree”.",
            "(Pointing to a wristwatch) What is the name of this object?",
            "(Pointing to a pen) What is the name of this object?",
            "Follow a three-stage command: Take a paper in your hand",
            "fold it in half,",
            "and put it on the floor",
            "Repeat the following: “No ifs, ands, or buts”",
            "Read and obey the following: CLOSE YOUR EYES",
            "Write a sentence about your mood today or today’s weather",
            "Copy the design shown (2 overlapping pentagons)"
        ]},
        {key: "UpperExtremity", question: [
            "How Long does it take to write with non-dominant hand? put minus in front of the time (Jebsen Hand Function Test)",
            "How Long does it take to write with dominant hand? put minus in front of the time (Jebsen Hand Function Test)",
            "How Long does it take to turn the card with non-dominant hand? put minus in front of the time (Jebsen Hand Function Test)",
            "How Long does it take to turn the card with dominant hand? put minus in front of the time (Jebsen Hand Function Test)",
            "What is the score of wrist up (CUE-T test)?",
            "What is the score of push down (CUE-T test)?",
            "What is the score of reach forward (CUE-T test)?",
        ]},
        {key: "Movement", question: [
            "Ankle dorsiflexion from plantar flexed position (Motricity index)",
            "Knee extension from 90 degrees, voluntary contraction (Motricity index)",
            "Hip flexion movement from 90 degrees (Motricity index)",
            "10-meter walking record (in seconds) (10-meter walking test)"
        ]},
    ];

    const disabilities_descriptions=[
        {key: "Cognition", question: (
            <>
                (Cognition tests) <br />
                Mini-Mental State Examination (MMSE) is a widely used cognitive screening tool designed to assess mental status and detect cognitive impairments, such as dementia.<br />
                It evaluates various cognitive functions, including orientation, memory, attention, language, and visuospatial skills. <br />
                The test consists of simple tasks like recalling words, following instructions, and performing basic calculations. See the video below for the instructions. <br />
                <iframe src={`https://www.youtube.com/embed/y39BDAljIbg`}></iframe><br />
            </>
        )},
        {key: "UpperExtremity", question: (
            <>
                (Upper Extremity tests) <br />
                The 1st test is Jebsen Hand Function Test. This tool is used to assess hand function and fine motor skills. See the video below for the instructions. <br />
                <iframe src={`https://www.youtube.com/embed/CIbTv0I4CYg`}></iframe><br />
                The 2nd test is CUE-T. This tool is an assessment of upper extremity function.<br />
                (1) Wrist up: Curl your wrist up as high as possible and then lower it all the way down. <br />
                Keep your arm on the arm rest. Do that as many times as you can in 30 seconds. See the photo below. <br />
                <img src={cue_t_photo_1} alt="CT Photo 1" style={{ width: '120px', height: 'auto' }} /><br />
                (2) Push down: Use your arms to raise your body off the seat and hold yourself up as long as you can. <br />
                Try to stay up for 30 seconds. See the photo below. <br />
                <img src={cue_t_photo_2} alt="CT Photo 2" style={{ width: '120px', height: 'auto' }} /><br />
                (3) Reach forward: Reach out and touch the round marker with you right(left) hand and return your hand to your lap. <br />
                Do not lean forward. Keep your back against the back of the chair. <br />
                Do that as many times as you can in 30 seconds. See the photo below. <br />
                <img src={cue_t_photo_3} alt="CT Photo 3" style={{ width: '120px', height: 'auto' }} /><br />
            </>
        )},
        {key: "Movement", question: (
            <>
                (Movement tests) <br />
                The 1st test is Motricity Index. This tool measures the strength of movements in the upper and lower limbs, focusing on specific muscle groups. See the video below for the instructions. <br />
                <iframe src={`https://www.youtube.com/embed/Srxg_84qkVk`}></iframe><br />
                The 2nd test is 10-meter walking test. This tool is a simple and widely used assessment to measure walking speed and functional mobility. See the video below for the instructions. <br />
                <iframe src={`https://www.youtube.com/embed/jKZcQM5PGq8`}></iframe><br />            
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
                setMessages([...messages, { text: "Are you a new patient? (yes/no)", user: false }]);
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
                        setMessages([...messages, { text: "Press Enter or Send button to proceed. ", user: false }]);
                    } else if (classifiedPain.toLowerCase().includes('upper extremity pain')) {
                        setCurrentStep('userInput_Upper_Extremity');
                        setMessages([...messages, { text: "Press Enter or Send button to proceed. ", user: false }]);
                    } else if (classifiedPain.toLowerCase().includes('back pain')) {
                        setCurrentStep('userInput_Low_Back_Pain');
                        setMessages([...messages, { text: "Press Enter or Send button to proceed. ", user: false }]);
                    } else if (classifiedPain.toLowerCase().includes('neck pain')) {
                        setCurrentStep('userInput_Neck_Pain');
                        setMessages([...messages, { text: "Press Enter or Send button to proceed. ", user: false }]);
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
                    <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                    {message.user ? (
                      <UserMessage>{renderMessageText(message.text)}</UserMessage>
                    ) : (
                      <BotMessage>{renderMessageText(message.text)}</BotMessage>
                    )}
                    {message.user && (
                      <StyledButton onClick={() => handleRevise(index)}>Revise</StyledButton>
                    )}
                  </div>
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
