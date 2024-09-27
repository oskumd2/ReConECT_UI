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

const GlobalWrapper = styled.div`
    margin-left: 30px; /* Set your desired margin-left value here */
    font-family: 'Roboto', sans-serif;
`;
const StyledButton = styled.button`
    background-color: #4CAF50; /* Green */
    border: none;
    color: white;
    padding: 7px 14px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 2px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s;
    &:hover {
        background-color: #45a049;
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
        { key: "patient_chief_complaint", question: "(Q0)\nDoctor: What is your chief complaint?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q1", question: "(Q1)\nDoctor: When did the symptom start?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q2", question: (
            <>
                (Q2)<br />
                Doctor: Where does it hurt? Multiple choices are possible among buttock, hip joint, thigh, calf, knee joint. See Photo 1.<br />
                <img src={lower_extremity_photo_1} alt="LE Photo 1" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.length > 0 },
        { key: "Q3", question: "(Q3)\nDoctor: Which side does it hurt? Possible choices are front, back, lateral, or medial.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q4", question: "(Q4)\nDoctor: Specify the direction of the painful site. Possible choices are right, left, or both.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q5", question: "(Q5)\nDoctor: If the pain radiate to different areas, tell me the areas. Examples are low back, perineum, buttock, head and neck.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q6", question: "(Q6)\nDoctor: Do you ever have times when the joint doesn't move properly (catching) or feel rigid?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q7", question: "(Q7)\nDoctor: Does the joint make clicking or rubbing sounds accompanied by pain?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "(Q8)\nDoctor: Does the joint make clicking sounds without pain?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q9", question: "(Q9)\nDoctor: Is there heat sense at the painful site?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q10", question: "(Q10)\nDoctor: Is there bruising at the painful site?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q11", question: "(Q11)\nDoctor: Is there swelling at the painful site (localized swelling)?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q12", question: "(Q12)\nDoctor: Is there altered sensation in buttock, thigh, or foot?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "(Q13)\nDoctor: Have you recently experienced trauma such as car accidents or falls?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q14", question: "(Q14)\nDoctor: Have you recently played soccer or done exercises like splits or gymnastics?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q15", question: "(Q15)\nDoctor: If you are an athlete, specify the sport you are playing.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q16", question: "(Q16)\nDoctor: Have you traveled abroad recently?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "(Q17)\nDoctor: Does the pain worsen during walking or running?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: "(Q18)\nDoctor: Does the pain worsen during sitting?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: "(Q19)\nDoctor: Does the pain worsen during weight-bearing exercises?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "(Q20)\nDoctor: Does the pain worsen after exercise?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: "(Q21)\nDoctor: Does the pain worsen when bending your knee for an extended period?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "(Q22)\nDoctor: Does the pain alleviate when lying down?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "(Q23)\nDoctor: How old are you?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q24", question: "(Q24)\nDoctor: What is your gender? Choices are female or male.\nPatient: ", validator: (x) => x.toLowerCase() === 'female' || x.toLowerCase() === 'male' },
        { key: "Q25", question: "(Q25)\nDoctor: Does pain occur when walking up stairs or sitting for an extended period?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q26", question: "(Q26)\nDoctor: Have you ever been diagnosed with osteoporosis?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q27", question: "(Q27)\nDoctor: Have you ever been diagnosed with at least one of the following - cancer, stroke, deep vein thrombosis, heart failure, pregnancy, varicose veins, nephrotic syndrome, rheumatological disease, acute inflammatory bowel disease?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q28", question: "(Q28)\nDoctor: Have you recently had any hormonal treatments, chemotherapy, taken birth control pills, experienced prolonged immobility, or been on a long flight?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q29", question: (
            <>
                (Q29)<br />
                Doctor: Is your FABER test result positive? See Video 1 for instructions.<br />
                <iframe src={`https://www.youtube.com/embed/Nvc7YsxdD28`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: "(Q30)\nDoctor: Is there tenderness at the sore spot?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: (
            <>
                (Q31)<br />
                Doctor: Is your Pace maneuver result positive? See Video 2 for instructions.<br />
                <iframe src={`https://www.youtube.com/embed/WhuPgPx4GtM`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q32", question: (
            <>
                (Q32)<br />
                Doctor: Is your Lachman test result positive? See Video 3 for instructions.<br />
                <iframe src={`https://www.youtube.com/embed/gfN-p-xZx24`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q33", question: (
            <>
                (Q33)<br />
                Doctor: Is your Reverse Lachman test result positive? See Video 4 for instructions.<br />
                <iframe src={`https://www.youtube.com/embed/sXlW2lPXf4s`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q34", question: (
            <>
                (Q34)<br />
                Doctor: Is your Valgus stress test result positive? See Video 5 for instructions.<br />
                <iframe src={`https://www.youtube.com/embed/ys8JxW79m2E`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q35", question: (
            <>
                (Q35)<br />
                Doctor: Is your McMurray test result positive? See Video 6 for instructions.<br />
                <iframe src={`https://www.youtube.com/embed/nqp7PwEj0Es`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q36", question: "(Q36)\nDoctor: Is there tenderness at the front side of the knee?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q37", question: "(Q37)\nDoctor: Are you unable to bend knees to 90 degrees?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q38", question: "(Q38)\nDoctor: Are you unable to bear weight for 4 steps while walking?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q39", question: "(Q39)\nDoctor: Is there a discoloration on your skin?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q40", question: "(Q40)\nDoctor: Is there a weakness in leg muscles?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q41", question: "(Q41)\nDoctor: Are you walking with a limp?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q42", question: "(Q42)\nDoctor: Have you had surgery around the hip joint, taken steroids, or received intra-articular injections?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }
    ];

    const questions_Upper_Extremity = [
        { key: "patient_chief_complaint", question: "(Q0)\nDoctor: What is your chief complaint?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q1", question: "(Q1)\nDoctor: When did the symptom start?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q2", question: "(Q2)\nDoctor: Where does it hurt? Multiple choices possible among shoulder girdle, shoulder joint, upper arm, elbow, forearm, wrist, fingers.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q3", question: "(Q3)\nDoctor: Which side does it hurt? Possible choices are front, back, lateral, medial, dorsal, ventral.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q4", question: "(Q4)\nDoctor: Specify the direction of the painful site. Possible choices are right, left, or both.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q5", question: "(Q5)\nDoctor: If the pain radiates to different areas, tell me the areas. Examples are upper arm and forearm.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q6", question: "(Q6)\nDoctor: Was the onset of pain gradual or abrupt?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q7", question: "(Q7)\nDoctor: Did you have fever or night sweating?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "(Q8)\nDoctor: Did you lose weight recently?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q9", question: "(Q9)\nDoctor: Are there new respiratory symptoms such as breathing difficulties, cough, or sputum?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q10", question: "(Q10)\nDoctor: Is there weakness in arm?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q11", question: "(Q11)\nDoctor: Is the grasping strength weaker than before?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q12", question: "(Q12)\nDoctor: Is there weakness in extension of the elbow compared with the healthy side?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "(Q13)\nDoctor: Is there clicking sound during elbow flexion or extension?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q14", question: (
            <>
                (Q14)<br />
                Doctor: Is there friction sound around pisiform bone when bending your wrist? See Photo 1.<br />
                <img src={upper_extremity_photo_1} alt="UE Photo 1" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q15", question: "(Q15)\nDoctor: Is there friction sound during wrist flexion or extension?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "(Q16)\nDoctor: Is there a decrease in range of motion at the wrist (does your wrist move less than it used to)?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "(Q17)\nDoctor: Have you ever experienced a catching or locking sensation in your wrist?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: (
            <>
                (Q18)<br />
                Doctor: Is it difficult to extend your proximal interphalangeal joint of the finger? See Photo 2.<br />
                <img src={upper_extremity_photo_2} alt="UE Photo 2" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: (
            <>
                (Q19)<br />
                Doctor: Is it difficult to extend the distal interphalangeal joint of the finger? See Photo 2.<br />
                <img src={upper_extremity_photo_2} alt="UE Photo 2" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "(Q20)\nDoctor: Is it difficult to bend (flex) the distal interphalangeal joint of the finger?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: (
            <>
                (Q21)<br />
                Doctor: Is there a triggering phenomenon when bending your fingers? See Video 1.<br />
                <iframe src={`https://www.youtube.com/embed/8hq9K96rM1c`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "(Q22)\nDoctor: Is there a rapidly increasing mass at the elbow?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "(Q23)\nDoctor: Does the pain aggravate during sleep?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q24", question: "(Q24)\nDoctor: Does the pain aggravate when sleeping toward the aching side?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q25", question: "(Q25)\nDoctor: Does the pain occur only during specific posture. Examples are during throwing a ball or serving a tennis ball.\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q26", question: "(Q26)\nDoctor: Have you lifted heavy objects recently?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q27", question: (
            <>
                (Q27)<br />
                Doctor: Is there a triggering phenomenon when bending your fingers? See Video 2.<br />
                <iframe src={`https://www.youtube.com/embed/R3xJDsJ_Nw4`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q28", question: "(Q28)\nDoctor: Have you recently experienced trauma at the painful site?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q29", question: "(Q29)\nDoctor: Does the pain worsen when grasping firmly?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: (
            <>
                (Q30)<br />
                Doctor: Does the pain worsen during wrist flexion or forearm pronation? See Photo 3.<br />
                <img src={upper_extremity_photo_3} alt="UE Photo 3" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: (
            <>
                (Q31)<br />
                Doctor: Does the pain occur at the cubital fossa when bending the elbow or throwing an object? See Photo 4.<br />
                <img src={upper_extremity_photo_4} alt="UE Photo 4" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q32", question: (
            <>
                (Q32)<br />
                Doctor: Does the pain occur at the cubital fossa when lifting heavy objects? See Photo 4.<br />
                <img src={upper_extremity_photo_4} alt="UE Photo 4" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q33", question: "(Q33)\nDoctor: Does the pain worsen during extension of your elbow?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q34", question: "(Q34)\nDoctor: Have you recently played racket sports or golf more frequently than usual?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q35", question: "(Q35)\nDoctor: Does the pain worsen after playing racket sports, golf or fishing?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q36", question: "(Q36)\nDoctor: Have you recently done activities involving your thumb, such as using scissors?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q37", question: "(Q37)\nDoctor: Have you ever received steroid injections in your elbow or taken oral steroids?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q38", question: "(Q38)\nDoctor: Did the pain occur after grasping something firmly?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q39", question: "(Q39)\nDoctor: Have you ever been diagnosed with breast or lung cancer?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q40", question: "(Q40)\nDoctor: Did swelling of the elbow occur following trauma?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q41", question: "(Q41)\nDoctor: Did the wrist or finger pain worsen 1-2 days after an injury?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q42", question: "(Q42)\nDoctor: Was there a persistent pain despite ice, rest, immobilization, pain medications after a few days?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q43", question: (
            <>
                (Q43)<br />
                Doctor: Is there a subacromial sulcus at the lateral side of the shoulder? See Photo 5.<br />
                <img src={upper_extremity_photo_5} alt="UE Photo 5" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q44", question: (
            <>
                (Q44)<br />
                Doctor: Is passive ROM of shoulder generally greater than active ROM of shoulder? See Video 3 and 4.<br />
                <iframe src={`https://www.youtube.com/embed/cP4LLJie9kw`}></iframe><br />
                <iframe src={`https://www.youtube.com/embed/n9HQIw1LHDY`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q45", question: (
            <>
                (Q45)<br />
                Doctor: Is ROM decreased in all 4 directions compared with healthy side? See Video 3 and 4.<br />
                <iframe src={`https://www.youtube.com/embed/cP4LLJie9kw`}></iframe><br />
                <iframe src={`https://www.youtube.com/embed/n9HQIw1LHDY`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q46", question: (
            <>
                (Q46)<br />
                Doctor: Are active and passive ROM both decreased compared with healthy side? See Video 3 and 4.<br />
                <iframe src={`https://www.youtube.com/embed/cP4LLJie9kw`}></iframe><br />
                <iframe src={`https://www.youtube.com/embed/n9HQIw1LHDY`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q47", question: (
            <>
                (Q47)<br />
                Doctor: Is ROM decreased in only specific direction compared with healthy side? See Video 3 and 4.<br />
                <iframe src={`https://www.youtube.com/embed/cP4LLJie9kw`}></iframe><br />
                <iframe src={`https://www.youtube.com/embed/n9HQIw1LHDY`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q48", question: (
            <>
                (Q48)<br />
                Doctor: Is there tenderness at the acro-clavicular joint or around rotator cuff? See Video 5.<br />
                <iframe src={`https://www.youtube.com/embed/U31quA3ZsjY&t=104s`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q49", question: "(Q49)\nDoctor: Is there tenderness at the neck?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q50", question: "(Q50)\nDoctor: Is there localized mass or swelling at the shoulder?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q51", question: "(Q51)\nDoctor: Is there localized redness and heat sense at the shoulder?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q52", question: (
            <>
                (Q52)<br />
                Doctor: Is there tenderness at the lateral epicondyle of the elbow? See Photo 6.<br />
                <img src={upper_extremity_photo_6} alt="UE Photo 6" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q53", question: "(Q53)\nDoctor: Is there tenderness at the medial epicondyle of the elbow?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q54", question: "(Q54)\nDoctor: Are there bruising, swelling, or redness at the cubital fossa?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q55", question: (
            <>
                (Q55)<br />
                Doctor: Can you observe a deformed shape which is known as Popeye’s belly around biceps when bending your elbow? See Photo 7.<br />
                <img src={upper_extremity_photo_7} alt="UE Photo 7" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q56", question: "(Q56)\nDoctor: Is there tenderness around the triceps tendon?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q57", question: "(Q57)\nDoctor: Is there redness, bruising or swelling at the triceps tendon insertion site?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q58", question: (
            <>
                (Q58)<br />
                Doctor: Is there redness, heat sense or swelling at the olecranon? See Photo 8.<br />
                <img src={upper_extremity_photo_8} alt="UE Photo 8" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q59", question: "(Q59)\nDoctor: Is the elbow both tender and swollen?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q60", question: "(Q60)\nDoctor: Is there localized swelling or tenderness at the ulnar side or back of the wrist?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q61", question: "(Q61)\nDoctor: Is there tenderness at the radial side of the wrist?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q62", question: (
            <>
                (Q62)<br />
                Doctor: Is the result of Finkelstein test positive? See Video 6.<br />
                <iframe src={`https://www.youtube.com/embed/Dm-_pumHt9c`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q63", question: (
            <>
                (Q63)<br />
                Doctor: Is there tenderness around extensor carpi ulnaris tendon? See Photo 9.<br />
                <img src={upper_extremity_photo_9} alt="UE Photo 9" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q64", question: "(Q64)\nDoctor: Is there tenderness at the dorsal side of the wrist?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q65", question: (
            <>
                (Q65)<br />
                Doctor: Is there swelling or bruising at the anatomical snuffbox? See Photo 10.<br />
                <img src={upper_extremity_photo_10} alt="UE Photo 10" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q66", question: "(Q66)\nDoctor: Is there tenderness, localized swelling or bruising at the distal radial side of the forearm?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q67", question: (
            <>
                (Q67)<br />
                Doctor: Is there tenderness at the lunate? See Photo 11.<br />
                <img src={upper_extremity_photo_11} alt="UE Photo 11" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q68", question: "(Q68)\nDoctor: Do you experience tenderness when palpating the hollow area at the back of your wrist (distal to the radial styloid process, between the flexor carpi ulnaris tendon and the extensor carpi ulnaris tendon)?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q69", question: "(Q69)\nDoctor: Is there tenderness at the back (dorsal side) of the finger?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q70", question: "(Q70)\nDoctor: Is it impossible to extend proximal interphalangeal joint of the finger actively but possible to extend passively?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q71", question: "(Q71)\nDoctor: Is there redness, bruising, or swelling at the back (dorsal side) of the distal interphalangeal joint of the finger?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q72", question: (
            <>
                (Q72)<br />
                Doctor: Is there tenderness at the ulnar collateral ligament of the thumb? See Photo 12.<br />
                <img src={upper_extremity_photo_12} alt="UE Photo 12" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q73", question: "(Q73)\nDoctor: Is there tenderness at the ulnar or radial side in any of the interphalangeal joints of the fingers?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q74", question: (
            <>
                (Q74)<br />
                Doctor: Is there tenderness or nodule around A1 pulley of a finger? See Photo 13.<br />
                <img src={upper_extremity_photo_13} alt="UE Photo 13" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q75", question: "(Q75)\nDoctor: Is Bakody’s sign positive?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q76", question: "(Q76)\nDoctor: How old are you?\nPatient: ", validator: (x) => x.length > 0 }
    ];

    const questions_Low_Back_Pain = [
        { key: "patient_chief_complaint", question: "(Q0)\nDoctor: What is your chief complaint?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q1", question: "(Q1)\nDoctor: When did the symptom start?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q2", question: "(Q2)\nDoctor: Did the pain start suddenly, or did it develop gradually?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q3", question: "(Q3)\nDoctor: Where does it hurt? Multiple choices are possible among central, peripheral part of the back.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q4", question: "(Q4)\nDoctor: Specify the direction of the painful site. Possible choices are right, left, or both.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q5", question: "(Q5)\nDoctor: If the pain radiates to different areas, tell me the areas. Examples are thigh, calf, or foot.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q6", question: "(Q6)\nDoctor: Is there pain in perineal area or buttock?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q7", question: "(Q7)\nDoctor: Has the level of pain remained consistent since it first started, or has it fluctuated, with periods of improvement and worsening?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "(Q8)\nDoctor: Have you experienced the same type of pain before?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q9", question: "(Q9)\nDoctor: How severe is the pain on a scale of 0 to 10?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q10", question: "(Q10)\nDoctor: Did you unintentionally lose your weight recently?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q11", question: "(Q11)\nDoctor: Have you had fever (possibly indicating infection) recently?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q12", question: "(Q12)\nDoctor: Have you experienced any recent difficulties with bowel movements or urination?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "(Q13)\nDoctor: Is there persistent leg weakness or walking (gait) disturbance?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q14", question: "(Q14)\nDoctor: Is there back stiffness in the morning?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q15", question: "(Q15)\nDoctor: Is there pain in other joints?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "(Q16)\nDoctor: Have you noticed any changes in the skin color on your toes?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "(Q17)\nDoctor: Do you have a rash on your legs?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: "(Q18)\nDoctor: Have you recently had issues like eye inflammation (iritis), skin rashes, diarrhea, or discharge from the urethra?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: "(Q19)\nDoctor: Does back pain and radiating pain toward the legs worsen when bending over?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "(Q20)\nDoctor: Does the pain subside when lying down and aggravate when standing up?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: "(Q21)\nDoctor: Does the pain remain consistent regardless of the posture such as sitting, lying down?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "(Q22)\nDoctor: Does the pain occur when you straighten your back after bending over, or when you cough or sneeze?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "(Q23)\nDoctor: Does the pain occur when you stand up for an extended period, or when you walk?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q24", question: "(Q24)\nDoctor: How old are you?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q25", question: "(Q25)\nDoctor: When walking for a long time, do you experience pain in both legs or in one hip, and does bending your back relieve the pain?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q26", question: "(Q26)\nDoctor: Does the pain subside when doing exercise?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q27", question: "(Q27)\nDoctor: Does the pain linger even after rest?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q28", question: "(Q28)\nDoctor: Does the pain worsen during the night?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q29", question: "(Q29)\nDoctor: Have you recently had any serious accidents such as traffic accidents, fall?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: "(Q30)\nDoctor: Are you a cancer patient?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: "(Q31)\nDoctor: Have you taken oral steroids recently?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q32", question: "(Q32)\nDoctor: Have you recently had drug abuse?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q33", question: "(Q33)\nDoctor: Are you infected to HIV or currently in a state of weakened immune function?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q34", question: "(Q34)\nDoctor: Is there a noticeable difference in muscle size (atrophy) between both of your legs?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q35", question: (
            <>
                (Q35)<br />
                Doctor: Does the forward curve in your lower back (lumbar lordosis) stay the same whether you are sitting or standing? See Photo 1.<br />
                <img src={low_back_pain_photo_1} alt="LBP Photo 1" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q36", question: (
            <>
                (Q36)<br />
                Doctor: Does the forward curve in your lower back (lumbar lordosis) disappear while you walk? See Photo 1.<br />
                <img src={low_back_pain_photo_1} alt="LBP Photo 1" style={{ width: '120px', height: 'auto' }} /><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },     
        { key: "Q37", question: "(Q37)\nDoctor: Is there any sign of sideways curvature of the spine (scoliosis)?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q38", question: "(Q38)\nDoctor: When you walk, do your toes drag on the ground or do you lift your knees high to prevent them from dragging?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q39", question: (
            <>
                (Q39)<br />
                Doctor: Is Schober Test positive? See Video 1.<br />
                <iframe src={`https://www.youtube.com/embed/e2aRRkuS7eg`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },     
        { key: "Q40", question: "(Q40)\nDoctor: During the Schober test, did the pain worsen when you bent forward?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q41", question: "(Q41)\nDoctor: Did the pain worsen when you straightened your back during the Schober test?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q42", question: (
            <>
                (Q42)<br />
                Doctor: Are you able to raise both legs more than 60 degrees during Straight Leg Raise? See Video 2.<br />
                <iframe src={`https://www.youtube.com/embed/RKs1grlLDpU`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },  
        { key: "Q43", question: "(Q43)\nDoctor: (To guardians) Press on different areas of the lower back. Does the patient complain of widespread tenderness or tenderness even when pressing softly?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q44", question: "(Q44)\nDoctor: What is your gender? Possible choices are male and female.\nPatient: ", validator: (x) => x.toLowerCase() === 'male' || x.toLowerCase() === 'female' }
    ];

    const questions_Neck_Pain = [
        { key: "patient_chief_complaint", question: "(Q0)\nDoctor: What is your chief complaint?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q1", question: "(Q1)\nDoctor: When did the symptom start?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q2", question: "(Q2)\nDoctor: Did the pain start abruptly or gradually?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q3", question: "(Q3)\nDoctor: Which side does it hurt? Possible choices are front, back, lateral, or medial.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q4", question: "(Q4)\nDoctor: Specify the direction of the painful site. Possible choices are right, left, or both.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q5", question: "(Q5)\nDoctor: If the pain radiates to different areas, tell me the areas. Examples are shoulder girdle, upper arm, forearm, fingers, or head.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q6", question: "(Q6)\nDoctor: Do you feel pain on only one side of your head, or in areas like the back of your head, around your ears, jawbone, or cheekbone?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q7", question: "(Q7)\nDoctor: Is there persistent headache?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "(Q8)\nDoctor: Is the neck pain accompanied by severe arm pain?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q9", question: "(Q9)\nDoctor: Is there weakness or muscle getting thinner (atrophy) in arms or legs?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q10", question: "(Q10)\nDoctor: Is the weakness more severe in legs than in arms?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q11", question: "(Q11)\nDoctor: Do you have numbness or abnormal sensations in your arms or legs?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q12", question: "(Q12)\nDoctor: Have you recently experienced dizziness, vision problems, or ringing in your ears?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "(Q13)\nDoctor: How old are you?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q14", question: "(Q14)\nDoctor: What is your gender?\nPatient: ", validator: (x) => x.toLowerCase() === 'female' || x.toLowerCase() === 'male' },
        { key: "Q15", question: "(Q15)\nDoctor: Does the pain worsen during coughing, sneezing, or doing Valsalva maneuver?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "(Q16)\nDoctor: Does the pain worsen when you tilt your head backward?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "(Q17)\nDoctor: Have you recently experienced trauma?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: "(Q18)\nDoctor: Did you fall from a height of more than 5 stairs or over 90 meters?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: "(Q19)\nDoctor: Did you injure your neck while diving?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "(Q20)\nDoctor: Were you rear-ended at a high speed (e.g. over 100 kilometers per hour), ejected from the vehicle during a car accident, or did the vehicle overturn?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: "(Q21)\nDoctor: Were you in a motorcycle or bicycle accident?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "(Q22)\nDoctor: Are you a patient with osteoporosis?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "(Q23)\nDoctor: Have you ever received corticosteroid treatment?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q24", question: "(Q24)\nDoctor: Are you a cancer patient?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q25", question: "(Q25)\nDoctor: Have you experienced unintentional weight loss recently?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q26", question: "(Q26)\nDoctor: Have you been receiving treatment for neck pain for over a month without any improvement?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q27", question: "(Q27)\nDoctor: Have you had any difficulties in bowel movement or urination?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q28", question: "(Q28)\nDoctor: Have you ever abused intravenous drugs?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q29", question: "(Q29)\nDoctor: Have you previously had any neck surgeries?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q30", question: "(Q30)\nDoctor: Does the pain improve when you raise the arm of the affected side above your head (Bakody’s sign)?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q31", question: (
            <>
                (Q31)<br />
                Doctor: Is Hoffman’s sign positive? See Video 1.<br />
                <iframe src={`https://www.youtube.com/embed/GJ-Q2ibYAHs`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q32", question: (
            <>
                (Q32)<br />
                Doctor: Is Babinski’s sign positive? See Video 2.<br />
                <iframe src={`https://www.youtube.com/embed/XMKEAm63SoM`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q33", question: (
            <>
                (Q33)<br />
                Doctor: Is Spurling’s Test positive? See Video 3.<br />
                <iframe src={`https://www.youtube.com/embed/h8GxF73P6GQ`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q34", question: (
            <>
                (Q34)<br />
                Doctor: Is L’hermitte’s sign positive? See Video 4.<br />
                <iframe src={`https://www.youtube.com/embed/mDQ-UdK-PDs`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q35", question: "(Q35)\nDoctor: Is there localized tenderness in lateral side of the neck?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q36", question: (
            <>
                (Q36)<br />
                Doctor: Is there an increase in Knee Jerk Reflex? See Video 5.<br />
                <iframe src={`https://www.youtube.com/embed/K7FEm8JnV-s`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q37", question: "(Q37)\nDoctor: Do you have tenderness where the back of your head meets your neck?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q38", question: "(Q38)\nDoctor: Has your neck’s range of motion decreased, or does it feel stiff when you move it?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }
    ];

    const complication_questions_Traumatic_Brain_Injury = [
        { key: "Q1", question: "(Q1)\nDoctor: How long has it been since you were diagnosed with traumatic brain injury?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q2", question: "(Q2)\nDoctor: Is there nausea, vomiting or drooping?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q3", question: "(Q3)\nDoctor: Do you have persistent headache (In patients with communication difficulties, does the patient appear agitated or have any noticeable swelling)?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q4", question: "(Q4)\nDoctor: Do you have a stabbing or sharp, knife-like headache, or does your head hurt even when lightly touched?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q5", question: "(Q5)\nDoctor: Are there difficulties in walking (gait disturbance), memory loss (dementia) or difficulties in voiding (urinary incontinence)?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q6", question: "(Q6)\nDoctor: Are there fatigue, cold intolerance, depression, missing periods (amenorrhea), or problems with thinking or memory?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q7", question: "(Q7)\nDoctor: Have you recently experienced fever, high blood pressure, sweating, rapid breathing, a fast heartbeat, posture issues, or muscle stiffness?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q8", question: "(Q8)\nDoctor: Do you difficulties in breathing, sputum, or cough?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q9", question: "(Q9)\nDoctor: Have you noticed a loss of smell, blind spots that appear differently in each eye, or any decrease in vision?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q10", question: "(Q10)\nDoctor: Do your arms or legs feel stiff when you try to move them?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q11", question: "(Q11)\nDoctor: Do you have any joints that are swollen, warm, painful, or have limited movement? Commonly affected joints include the hip, elbow, shoulder, and knee.\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q12", question: "(Q12)\nDoctor: Do you have insomnia, excessive sleep, or excessive daytime sleepiness?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q13", question: "(Q13)\nDoctor: Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.\nPatient: ", validator: (x) => x.length > 0 }
    ];

    const complication_questions_Stroke = [
        { key: "Q1", question: "(Q1)\nDoctor: How long has it been since you were diagnosed with stroke?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q2", question: "(Q2)\nDoctor: Have you experienced new onset of decreased concentration, disorientation, memory loss, or language difficulties within a few days after the stroke, with these symptoms fluctuating between improvement and worsening?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q3", question: "(Q3)\nDoctor: Have your arms or legs become stiffer than usual when you try to move them?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q4", question: "(Q4)\nDoctor: Do you experience choking while swallowing food, a change in your voice after eating, difficulty swallowing, or a feeling of food stuck in your throat?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q5", question: "(Q5)\nDoctor: Is there shoulder pain?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q6", question: "(Q6)\nDoctor: Has your shoulder’s range of motion, especially when rotating outward or lifting it to the side, decreased?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q7", question: "(Q7)\nDoctor: Have you recently noticed swelling, warmth, or ‘pain during movement’ in your wrist or hand?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "(Q8)\nDoctor: Have you developed pain in areas where you have numbness or tingling, such as your face or limbs?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q9", question: "(Q9)\nDoctor: Do you have pain that gets worse with exercise and improves with rest?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q10", question: "(Q10)\nDoctor: Do you feel pain triggered by movement, touch, or changes in temperature (allodynia)?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q11", question: "(Q11)\nDoctor: Do you have constipation or difficulty holding your urine?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q12", question: "(Q12)\nDoctor: Do you experience persistent feelings of depression?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q13", question: "(Q13)\nDoctor: Do you frequently experience anxiety?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q14", question: "(Q14)\nDoctor: Have you recently lost motivation in social activities or been participating less in rehabilitation programs than usual?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q15", question: "(Q15)\nDoctor: Have you had abrupt chest pain recently?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q16", question: "(Q16)\nDoctor: Have you been lying in bed for more than three days, or do you have swelling or tenderness in your legs?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q17", question: "(Q17)\nDoctor: Have you been coughing frequently, noticed a change in the color of your phlegm, or experienced shortness of breath recently?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q18", question: "(Q18)\nDoctor: Have you been waking up frequently during sleep or noticed that your snoring has become worse?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q19", question: "(Q19)\nDoctor: Have you experienced headache recently?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q20", question: "(Q20)\nDoctor: Are you overweight (BMI>25)?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q21", question: "(Q21)\nDoctor: Do you feel drowsy during the day?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q22", question: "(Q22)\nDoctor: Do you have trouble falling asleep or waking up in the middle of the night?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q23", question: "(Q23)\nDoctor: Have you had any falls recently?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q24", question: (
            <>
                (Q24)<br />
                Doctor: Do you experience double vision when looking at objects, or did you have any blind spots when you took the visual field test? See Video 1.<br />
                <iframe src={`https://www.youtube.com/embed/OodMJMPcITQ`}></iframe><br />
                Patient:
            </>
        ), validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' }, 
        { key: "Q25", question: "(Q25)\nDoctor: Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.\nPatient: ", validator: (x) => x.length > 0 }
    ];

    const complication_questions_Parkinsons_Disease = [
        { key: "Q1", question: "(Q1)\nDoctor: How long has it been since you were diagnosed with Parkinson’s Disease?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q2", question: "(Q2)\nDoctor: Are you currently taking levodopa?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q3", question: "(Q3)\nDoctor: Do you recurrently experience shaking and times when you can't control your walking, feeling like your feet are stuck?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q4", question: "(Q4)\nDoctor: Do you recurrently feel pain, excessive sweating, a fast heartbeat, stomach discomfort, or experience feelings of depression or anxiety?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q5", question: "(Q5)\nDoctor: Do you have uncontrollable movements that make it hard to sit, walk, or do everyday tasks?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q6", question: "(Q6)\nDoctor: Have you recently experienced moments when you suddenly couldn't move (immobility)?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q7", question: "(Q7)\nDoctor: Was there an abrupt change in medication recently?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q8", question: "(Q8)\nDoctor: Have you had constipation recently?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q9", question: "(Q9)\nDoctor: Have you been sweating a lot recently or drinking less water recently (dehydration)?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q10", question: "(Q10)\nDoctor: Have you had any injuries recently?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q11", question: "(Q11)\nDoctor: Have you ever had slow movements along with a fast heartbeat or sweating?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q12", question: "(Q12)\nDoctor: Have you had high fever (>39°C) recently?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q13", question: "(Q13)\nDoctor: Have you had long periods of uncontrollable, jerky movements throughout your body (generalized dyskinesia)?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q14", question: "(Q14)\nDoctor: Have you had diarrhea?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q15", question: "(Q15)\nDoctor: Have you noticed overly strong reflexes or unusually large pupils?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q16", question: "(Q16)\nDoctor: Have you recently started taking a new medication or increased the dosage of an existing one?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q17", question: "(Q17)\nDoctor: Have you experienced a mix of shaking, sudden jerking movements, restlessness, or muscle stiffness?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q18", question: "(Q18)\nDoctor: (To guardian) Does the patient seem to have visual hallucinations or paronoia, especially towards relatives?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q19", question: "(Q19)\nDoctor: (To guardian) Does the patient have periods where his/her focus or attention comes and goes?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q20", question: "(Q20)\nDoctor: (To guardian) Does the patient have confused speech or noticeable changes in behavior?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q21", question: "(Q21)\nDoctor: (To guardian) Does the patient have dementia?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q22", question: "(Q22)\nDoctor: (To guardian) Has the patient recently had an infection, been exposed to any toxins, or undergone surgery?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q23", question: "(Q23)\nDoctor: (To guardian) Has the patient recently took antidepressants or painkillers?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q24", question: "(Q24)\nDoctor: Have you recently engaged in gambling, compulsive shopping, abnormal sexual behaviors or binge eating?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q25", question: "(Q25)\nDoctor: Have you ever had obsessive-compulsive disorder or impulsive personality?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q26", question: "(Q26)\nDoctor: Have you recently quitted medications (possible rapid reduction of dopamine agonists)?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q27", question: "(Q27)\nDoctor: Have you recently increased levodopa dose without doctor’s permission?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q28", question: "(Q28)\nDoctor: Have you recently had frequent mood changes?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q29", question: "(Q29)\nDoctor: Have you recently experienced lightheadedness with blurry vision on standing or walking?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q30", question: "(Q30)\nDoctor: Have you recently had a hard time concentrating?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q31", question: "(Q31)\nDoctor: Have you had discomfort in your head or neck after meal?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q32", question: "(Q32)\nDoctor: Have you lost consciousness?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q33", question: "(Q33)\nDoctor: Do you frequently cough, choke, or experience regurgitation through your nose during meals?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q34", question: "(Q34)\nDoctor: Do you frequently catch a cold or drool?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q35", question: "(Q35)\nDoctor: Has the effectiveness of levodopa decreased recently?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q36", question: "(Q36)\nDoctor: Have you recently experienced a swollen belly, stomach pain, or vomiting?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q37", question: "(Q37)\nDoctor: Do you feel undesirable sleepiness during daytime even after enough sleep?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q38", question: "(Q38)\nDoctor: Have you suddenly fell asleep during a conversation, a meal, or driving?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q39", question: "(Q39)\nDoctor: Do you often have unpleasant dreams (for example being attacked or robbed)?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q40", question: "(Q40)\nDoctor: (To guardians) Does the patient show vigorous behaviors such as punching, jumping out of bed, or shouting?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q41", question: "(Q41)\nDoctor: Have you been falling frequently recently?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q42", question: "(Q42)\nDoctor: Have you received deep brain stimulation?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q43", question: "(Q43)\nDoctor: Have you received levodopa-carbidopa intestinal gel infusion?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q44", question: "(Q44)\nDoctor: Have you experienced stomach pain, flatulence or constipation?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q45", question: "(Q45)\nDoctor: Have you received Apomorphine subcutaneous injections?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q46", question: "(Q46)\nDoctor: Have you experienced nausea?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q47", question: "(Q47)\nDoctor: Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.\nPatient: ", validator: (x) => x.length > 0 }
    ];

    const complication_questions_Spinal_Cord_Injury = [
        { key: "Q1", question: "(Q1)\nDoctor: How long has it been since you were diagnosed with a spinal cord injury?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q2", question: "(Q2)\nDoctor: Have you recently experienced a cough, changes in sputum color, shortness of breath, or fever?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q3", question: "(Q3)\nDoctor: Have you recently had chest pain that worsens when you breathe?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q4", question: "(Q4)\nDoctor: Have you been waking up frequently during sleep or noticed that your snoring has become worse?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q5", question: "(Q5)\nDoctor: Have you had dizziness, lightheadedness, pallor, yawning, weakness in muscles, fatigue or syncope?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q6", question: "(Q6)\nDoctor: Have you had headache or sweating?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q7", question: "(Q7)\nDoctor: Have you had flushing or stuffy nose (nasal congestion)?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q8", question: "(Q8)\nDoctor: Have you had trouble emptying your bladder or issues with a blocked catheter?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q9", question: "(Q9)\nDoctor: Have you had sudden, uncontrolled urine leakage, leftover urine after voiding, leaks when you cough or sneeze, or trouble with constant dribbling of urine?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q10", question: "(Q10)\nDoctor: Have you had severe constipation?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q11", question: "(Q11)\nDoctor: Have you experienced bowel incontinence?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q12", question: "(Q12)\nDoctor: Have you had unusually tight muscles (hypertonus), sudden or ongoing uncontrolled muscle reflexes (hyperreflexia), shaking or jerking movements (clonus), or painful muscle spasms?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q13", question: "(Q13)\nDoctor: Have you had pain during walking or overusing arm or shoulder (for example while using a manually operated wheelchair)?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q14", question: "(Q14)\nDoctor: Have you experienced burning, aching, tingling or stabbing sensations?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q15", question: "(Q15)\nDoctor: Is there any damage to the skin or tissue over bony areas (bony prominence) like your hip, tailbone, or heel (ischium, trochanters, sacrum, heel)?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q16", question: "(Q16)\nDoctor: (To guardians) Has the patient experienced inadequate nutrition?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q17", question: "(Q17)\nDoctor: Did you feel pain while moving (transferring) from bed to chair?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q18", question: "(Q18)\nDoctor: Do you have tenderness around your knees?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q19", question: "(Q19)\nDoctor: Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.\nPatient: ", validator: (x) => x.length > 0 }
    ];

    const complication_questions_ALS = [
        { key: "Q1", question: "(Q1)\nDoctor: How long has it been since you were diagnosed with ALS?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q2", question: "(Q2)\nDoctor: Is there excessive saliva production or drooling?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q3", question: "(Q3)\nDoctor: Is it difficult to cough up phlegm?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q4", question: "(Q4)\nDoctor: Is there inappropriate (disinhibited) laughing or crying, or signs of anxiety?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q5", question: "(Q5)\nDoctor: Have you had unusually tight muscles (hypertonus), sudden or ongoing uncontrolled muscle reflexes (hyperreflexia), shaking or jerking movements (clonus)?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q6", question: "(Q6)\nDoctor: Do you have muscle cramps that are bad enough to affect your daily activities or sleep?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q7", question: "(Q7)\nDoctor: Do you experience choking while swallowing food, a change in your voice after eating, difficulty swallowing, or a feeling of food stuck in your throat?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q8", question: "(Q8)\nDoctor: Do you feel short of breath even at rest, or does your breathing improve when sitting up?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q9", question: "(Q9)\nDoctor: Do you have sleep problems not caused by pain or mood issues, loss of appetite, morning headaches, daytime sleepiness, or trouble concentrating?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q10", question: "(Q10)\nDoctor: Have you felt down, lost interest in things you usually enjoy, lacked motivation, or become more easily irritated?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q11", question: "(Q11)\nDoctor: Have you felt tired, low on energy, easily worn out, sleepy, or less focused than usual (diminished alertness)?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q12", question: "(Q12)\nDoctor: (To guardians) Has the patient shown a lack of motivation (apathy), trouble controlling impulses (disinhibition), difficulty with planning or decision-making (executive dysfunction), or trouble finding the right words when speaking (reduced verbal fluency)?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q13", question: "(Q13)\nDoctor: Do you have difficulties in sleeping?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q14", question: "(Q14)\nDoctor: Have you had muscle or joint pain, especially in your neck or shoulder?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q15", question: "(Q15)\nDoctor: How old are you?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q16", question: "(Q16)\nDoctor: Have you had sudden, strong urges to urinate that sometimes lead to accidental leaks?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q17", question: "(Q17)\nDoctor: (If you have a blood pressure monitor) Have you measured your blood pressure two or more times, and was the systolic pressure always 140 mmHg or higher, or the diastolic pressure always 90 mmHg or higher?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q18", question: "(Q18)\nDoctor: Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.\nPatient: ", validator: (x) => x.length > 0 }
    ];

    const complication_questions_Peripheral_Neuropathy = [
        { key: "Q1", question: "(Q1)\nDoctor: How long has it been since you were diagnosed with peripheral neuropathy?\nPatient: ", validator: (x) => x.length > 0 },
        { key: "Q2", question: "(Q2)\nDoctor: Do you check your feet every day for any wounds?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q3", question: "(Q3)\nDoctor: Do you keep your feet well moisturized?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q4", question: "(Q4)\nDoctor: Do you have diabetes?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q5", question: "(Q5)\nDoctor: Are your feet warmer than usual, or do you notice any redness or swelling?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q6", question: "(Q6)\nDoctor: Have you felt a dull, deep muscle pain that feels like a toothache or cramping?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q7", question: "(Q7)\nDoctor: Have you felt a burning sensation or sensitivity to pain on the surface of your skin?\nPatient: ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "Q8", question: "(Q8)\nDoctor: Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.\nPatient: ", validator: (x) => x.length > 0 }
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
                setMessages([...messages, { text: "Do you have a diagnostic assessment? (yes/no)", user: false }]);
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
                    setMessages([...messages, { text: "Press any keys to register. ", user: false }]);
                } else if (input.toLowerCase() === 'no') {
                    setCurrentStep('not_new_patient');
                    setMessages([...messages, { text: "Press any keys for login.", user: false }]);
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
                    setMessages([...messages, { text: "ID already exists. Enter different 8-digits number. Press any keys to register again:", user: false }]);                        
                } else {
                    setID(temp_1);
                    setPassword(temp_2);
                    setCurrentStep('userInput');
                    setMessages([...messages, { text: "Registered! \n (Q0)\nDoctor: What is your chief complaint?\nPatient: ", user: false }]);
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
                    setMessages([...messages, { text: "Invalid Password. Press any keys to try again.", user: false }]);                        
                } else if (!response.data.valid_password) {
                    setCurrentStep('not_new_patient');
                    setMessages([...messages, { text: "Invalid ID. Press any keys to try again.", user: false }]);                        
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
                    setMessages([...messages, { text: "(Q0)\nDoctor: What is your chief complaint?\nPatient: ", user: false }]);
                }             
            } 
            if (currentStep === 'userInput') {
                if (input.toLowerCase()==='lower extremity pain'){
                    setCurrentStep('userInput_Lower_Extremity');
                } else if (input.toLowerCase()==='upper extremity pain'){
                    setCurrentStep('userInput_Upper_Extremity');
                } else if (input.toLowerCase()==='low back pain'){
                    setCurrentStep('userInput_Low_Back_Pain');
                } else if (input.toLowerCase()==='neck pain'){
                    setCurrentStep('userInput_Neck_Pain');
                } else {
                    setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
                }
                setMessages([...messages, { text: "Press any keys to proceed. ", user: false }]);
            }
            if (currentStep === 'userInput_Lower_Extremity'){
                const currentQuestion = questions_Lower_Extremity[Object.keys(patientInfo).length];
                if (currentQuestion.validator(input)) {
                    const newPatientInfo = { ...patientInfo, [currentQuestion.key]: input };
                    setPatientInfo(newPatientInfo);
                    if (Object.keys(newPatientInfo).length === questions_Lower_Extremity.length) {
                        response = await axios.post(`${herokulink}/user_input`, { 'patient_info': newPatientInfo, 'ID': ID, 'Password': Password});
                            setMessages([...messages, { text: input, user: true },{ text: response.data.diagnosis, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                        setCurrentStep('complete');
                    } else {
                        setMessages([...messages, { text: input, user: true }, { text: questions_Lower_Extremity[Object.keys(newPatientInfo).length].question, user: false }]);
                    }
                } else {
                    setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
                }
            }
            if (currentStep === 'userInput_Upper_Extremity'){
                const currentQuestion = questions_Upper_Extremity[Object.keys(patientInfo).length];
                if (currentQuestion.validator(input)) {
                    const newPatientInfo = { ...patientInfo, [currentQuestion.key]: input };
                    setPatientInfo(newPatientInfo);
                    if (Object.keys(newPatientInfo).length === questions_Upper_Extremity.length) {
                        response = await axios.post(`${herokulink}/user_input`, { 'patient_info': newPatientInfo, 'ID': ID, 'Password': Password});
                            setMessages([...messages, { text: input, user: true },{ text: response.data.diagnosis, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                        setCurrentStep('complete');
                    } else {
                        setMessages([...messages, { text: input, user: true }, { text: questions_Upper_Extremity[Object.keys(newPatientInfo).length].question, user: false }]);
                    }
                } else {
                    setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
                }            
            }
            if (currentStep === 'userInput_Low_Back_Pain'){
                const currentQuestion = questions_Low_Back_Pain[Object.keys(patientInfo).length];
                if (currentQuestion.validator(input)) {
                    const newPatientInfo = { ...patientInfo, [currentQuestion.key]: input };
                    setPatientInfo(newPatientInfo);
                    if (Object.keys(newPatientInfo).length === questions_Low_Back_Pain.length) {
                        response = await axios.post(`${herokulink}/user_input`, { 'patient_info': newPatientInfo, 'ID': ID, 'Password': Password});
                            setMessages([...messages, { text: input, user: true },{ text: response.data.diagnosis, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                        setCurrentStep('complete');
                    } else {
                        setMessages([...messages, { text: input, user: true }, { text: questions_Low_Back_Pain[Object.keys(newPatientInfo).length].question, user: false }]);
                    }
                } else {
                    setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
                }
            }
            if (currentStep === 'userInput_Neck_Pain'){
                const currentQuestion = questions_Neck_Pain[Object.keys(patientInfo).length];
                if (currentQuestion.validator(input)) {
                    const newPatientInfo = { ...patientInfo, [currentQuestion.key]: input };
                    setPatientInfo(newPatientInfo);
                    if (Object.keys(newPatientInfo).length === questions_Neck_Pain.length) {
                        response = await axios.post(`${herokulink}/user_input`, { 'patient_info': newPatientInfo, 'ID': ID, 'Password': Password});
                            setMessages([...messages, { text: input, user: true },{ text: response.data.diagnosis, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                        setCurrentStep('complete');
                    } else {
                        setMessages([...messages, { text: input, user: true }, { text: questions_Neck_Pain[Object.keys(newPatientInfo).length].question, user: false }]);
                    }
                } else {
                    setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
                }            
            }
            ///////////////////////
            if (currentStep === 'R_checkif_new_patient') {
                if (input.toLowerCase() === 'yes') {
                    setCurrentStep('R_new_patient');
                    setMessages([...messages, { text: "Press any keys to register. ", user: false }]);
                } else if (input.toLowerCase() === 'no') {
                    setCurrentStep('R_not_new_patient');
                    setMessages([...messages, { text: "Press any keys for login.", user: false }]);
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
                    setMessages([...messages, { text: "ID already exists. Enter different 8-digits number. Press any keys to register again:", user: false }]);                        
                } else {
                    setID(temp_1);
                    setPassword(temp_2);
                    setCurrentStep('File_not_exists');
                    setMessages([...messages, { text: "No existing patient info found for "+ ID+". Press any keys to write new Patient info.", user: false }]);
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
                    setMessages([...messages, { text: "Invalid ID. Press any keys to try again.", user: false }]);                        
                } else if (!response.data.valid_password) {
                    setCurrentStep('R_not_new_patient');
                    setMessages([...messages, { text: "Invalid Password. Press any keys to try again.", user: false }]);                        
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
                    setMessages([...messages, { text: input, user: true },{ text: "Press any keys to write new Patient info.", user: false }]);
                }       
            }
            if (currentStep === 'File_not_exists') {
                const patient_info_temp = [];
                const temp_1 = prompt(`Enter Diagnosis: `);
                patient_info_temp.push(temp_1);
                const temp_2 = prompt(`Enter disability (write your main difficulty): `);
                patient_info_temp.push(temp_2);

                response = await axios.post(`${herokulink}/Update_patient_info`, { 'patient_info': patient_info_temp, 'diagnosis_id': ID, 'Password': Password})
                setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false },{ text: ". Would you like to use these diagnosis and disabilities?", user: false }]);
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
                    setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false },{ text: "Press any keys to see rehabilitation training for decreased items.", user: false }]);
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
                    { text: "Press any keys to proceed", user: false }
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
                setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false },{ text: "Press any keys to compare today's score with last 7-day's score.", user: false }]);
            }
            if (currentStep === 'RehabTraining') {
                response =await axios.post(`${herokulink}/Get_rehabilitation_evaluation`, { 'decreased_items': decreased_items, 'disabilities': disabilities})
                setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false },{ text: "Now let me screen possible complications. Press any keys to proceed.", user: false }]);
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
            if (currentStep === 'ComplicationsInput_TBI') {
                    const currentQuestion = complication_questions_Traumatic_Brain_Injury[Object.keys(patientInfo).length];
                    if (currentQuestion.validator(input)) {
                            const newPatientInfo = { ...patientInfo, [currentQuestion.key]: input };
                            setPatientInfo(newPatientInfo);
                            if (Object.keys(newPatientInfo).length === complication_questions_Traumatic_Brain_Injury.length) {
                                response = await axios.post(`${herokulink}/complications_input`, { patient_info: newPatientInfo, diagnosis: diagnosis });
                                    setMessages([...messages, { text: input, user: true },{ text: response.data.diagnosis, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                                setCurrentStep('complete');
                            } else {
                                setMessages([...messages, { text: input, user: true }, { text: complication_questions_Traumatic_Brain_Injury[Object.keys(newPatientInfo).length].question, user: false }]);
                            }
                    } else {
                        setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
                    }
            }
            if (currentStep === 'ComplicationsInput_Stroke') {
                const currentQuestion = complication_questions_Stroke[Object.keys(patientInfo).length];
                if (currentQuestion.validator(input)) {
                        const newPatientInfo = { ...patientInfo, [currentQuestion.key]: input };
                        setPatientInfo(newPatientInfo);
                        if (Object.keys(newPatientInfo).length === complication_questions_Stroke.length) {
                            response = await axios.post(`${herokulink}/complications_input`, { patient_info: newPatientInfo, diagnosis: diagnosis });
                                setMessages([...messages, { text: input, user: true },{ text: response.data.diagnosis, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                            setCurrentStep('complete');
                        } else {
                            setMessages([...messages, { text: input, user: true }, { text: complication_questions_Stroke[Object.keys(newPatientInfo).length].question, user: false }]);
                        }
                } else {
                    setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
                }
            }
            if (currentStep === 'ComplicationsInput_PD') {
                const currentQuestion = complication_questions_Parkinsons_Disease[Object.keys(patientInfo).length];
                if (currentQuestion.validator(input)) {
                        const newPatientInfo = { ...patientInfo, [currentQuestion.key]: input };
                        setPatientInfo(newPatientInfo);
                        if (Object.keys(newPatientInfo).length === complication_questions_Parkinsons_Disease.length) {
                            response = await axios.post(`${herokulink}/complications_input`, { patient_info: newPatientInfo, diagnosis: diagnosis });
                                setMessages([...messages, { text: input, user: true },{ text: response.data.diagnosis, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                            setCurrentStep('complete');
                        } else {
                            setMessages([...messages, { text: input, user: true }, { text: complication_questions_Parkinsons_Disease[Object.keys(newPatientInfo).length].question, user: false }]);
                        }
                } else {
                    setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
                }
            }
            if (currentStep === 'ComplicationsInput_SCI') {
                const currentQuestion = complication_questions_Spinal_Cord_Injury[Object.keys(patientInfo).length];
                if (currentQuestion.validator(input)) {
                        const newPatientInfo = { ...patientInfo, [currentQuestion.key]: input };
                        setPatientInfo(newPatientInfo);
                        if (Object.keys(newPatientInfo).length === complication_questions_Spinal_Cord_Injury.length) {
                            response = await axios.post(`${herokulink}/complications_input`, { patient_info: newPatientInfo, diagnosis: diagnosis });
                                setMessages([...messages, { text: input, user: true },{ text: response.data.diagnosis, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                            setCurrentStep('complete');
                        } else {
                            setMessages([...messages, { text: input, user: true }, { text: complication_questions_Spinal_Cord_Injury[Object.keys(newPatientInfo).length].question, user: false }]);
                        }
                } else {
                    setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
                }
            }
            if (currentStep === 'ComplicationsInput_ALS') {
                const currentQuestion = complication_questions_ALS[Object.keys(patientInfo).length];
                if (currentQuestion.validator(input)) {
                        const newPatientInfo = { ...patientInfo, [currentQuestion.key]: input };
                        setPatientInfo(newPatientInfo);
                        if (Object.keys(newPatientInfo).length === complication_questions_ALS.length) {
                            response = await axios.post(`${herokulink}/complications_input`, { patient_info: newPatientInfo, diagnosis: diagnosis });
                                setMessages([...messages, { text: input, user: true },{ text: response.data.diagnosis, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                            setCurrentStep('complete');
                        } else {
                            setMessages([...messages, { text: input, user: true }, { text: complication_questions_ALS[Object.keys(newPatientInfo).length].question, user: false }]);
                        }
                } else {
                    setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
                }
            }
            if (currentStep === 'ComplicationsInput_PN') {
                const currentQuestion = complication_questions_Peripheral_Neuropathy[Object.keys(patientInfo).length];
                if (currentQuestion.validator(input)) {
                        const newPatientInfo = { ...patientInfo, [currentQuestion.key]: input };
                        setPatientInfo(newPatientInfo);
                        if (Object.keys(newPatientInfo).length === complication_questions_Peripheral_Neuropathy.length) {
                            response = await axios.post(`${herokulink}/complications_input`, { patient_info: newPatientInfo, diagnosis: diagnosis });
                                setMessages([...messages, { text: input, user: true },{ text: response.data.diagnosis, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                            setCurrentStep('complete');
                        } else {
                            setMessages([...messages, { text: input, user: true }, { text: complication_questions_Peripheral_Neuropathy[Object.keys(newPatientInfo).length].question, user: false }]);
                        }
                } else {
                    setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
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
        <GlobalWrapper>
            {currentStep === 'initial' && messages.length === 0 && (
                <div>Do you have a diagnostic assessment? (yes/no)</div>
            )}
            <div>
                {messages.map((message, index) => (
                    <div key={index} style={{color: message.user ? 'yellow' : 'lightgreen', fontSize: '17px'}}>
                        {renderMessageText(message.text)}
                        {message.user && (
                            <StyledButton onClick={() => handleRevise(index)} style={{ marginLeft: '10px' }}>Revise</StyledButton>
                        )}
                    </div>
                ))}
            </div>       
            <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()} // Add this line
                style={{ fontSize: '16px' }} 
            />     
            <StyledButton onClick={sendMessage}>Send</StyledButton>
        </GlobalWrapper>
    );
}

export default Chatbot_v2;
