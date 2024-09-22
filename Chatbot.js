import React, { useState } from 'react';
import axios from 'axios';

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [currentStep, setCurrentStep] = useState('initial');
    const [patientInfo, setPatientInfo] = useState({});
    const [diagnosis_id, setDiagnosis_id] = useState('');
    const [decreased_items, setDecreased_items] = useState([]);
    const [patientInfoTemp, setPatientInfoTemp] = useState([]);

    const questions = [
        { key: "patient_chief_complaint", question: "Enter patient's chief complaint: ", validator: (x) => x.length > 0 },
        { key: "patient_location", question: "Enter patient's pain location (e.g. Middle, right): ", validator: (x) => x.length > 0 },
        { key: "patient_radiation", question: "Is there pain radiation? (Yes/No, and location if Yes): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' || (x.toLowerCase().startsWith('yes') && x.length > 3) },
        { key: "patient_severity", question: "Enter pain severity (mild/moderate/severe): ", validator: (x) => /^(extremely\s+)?(mild|moderate|severe)$/i.test(x) },
        { key: "patient_alleviating_factors", question: "Is pain reduced by lying down? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_pain_increase", question: "Pain increase when looking at (aching/opposite/same) side: ", validator: (x) => ['aching', 'opposite', 'same'].includes(x.toLowerCase()) },
        { key: "patient_numbness_or_tingling", question: "Numbness or tingling in arm or hand? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_weakness", question: "Weaker or thinner arm than before? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_onset_of_pain", question: "When did the pain start? ", validator: (x) => x.length > 0 },
        { key: "patient_trauma_history", question: "Did pain start within 1 day of trauma? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_lower_back_pain", question: "Pain also in lower back? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_morning_stiffness", question: "Stiffness in morning? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_leg_symptoms", question: "Leg weakness or pain? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_coronary_heart_disease_history", question: "History of coronary heart disease? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_weight_loss_appetite", question: "Weight loss or decreased appetite? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_pregnancy_breastfeeding", question: "Pregnant or breast feeding? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_prolonged_sitting", question: "Prolonged sitting during work? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_fever", question: "Fever? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_cancer_steroid_history", question: "History of cancer or steroid use? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_osteoporosis", question: "Osteoporosis? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_age", question: "Patient's age: ", validator: (x) => /^\d+$/.test(x) && 0 < parseInt(x) < 120 },
        { key: "patient_alcohol_drug_use", question: "Alcoholic or drug abuse? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_HIV_status", question: "HIV? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_leg_bending_difficulty", question: "Difficult to bend leg? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_urinary_fecal_incontinence", question: "Urinary or fecal incontinence? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_shoulder_drooping_or_winging", question: "Shoulder drooping or winging? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_upper_neck_tenderness", question: "Tenderness at upper neck? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_arm_lift_score", question: "Arm lift against gravity score (0-5): ", validator: (x) => /^\d+$/.test(x) && 0 <= parseInt(x) <= 5 },
        { key: "patient_Babinski_Reflex", question: "Babinski Reflex (positive/negative): ", validator: (x) => ['positive', 'negative'].includes(x.toLowerCase()) },
        { key: "patient_sensation_in_arms", question: "Sensation difference between arms? (Yes/No): ", validator: (x) => x.toLowerCase() === 'yes' || x.toLowerCase() === 'no' },
        { key: "patient_Spurling_test", question: "Spurling test result (positive/negative): ", validator: (x) => ['positive', 'negative'].includes(x.toLowerCase()) }
    ];

    const sendMessage = async () => {
        try {
            let response;
            if (currentStep === 'initial') {
                setMessages([...messages, { text: "Do you have a diagnostic assessment? (yes/no)", user: false }]);
                response = await axios.post('http://127.0.0.1:5011/check_diagnosis', { has_diagnosis: input });
                if (input.toLowerCase() === 'no') {
                    if (response.data.hasExistingInfo) {
                        setMessages([...messages, { text: "Found existing patient information. Would you like to use it? (yes/no)", user: false }]);         
                        setCurrentStep('awaitingExistingInfoResponse');
                    } else {
                        setMessages([...messages, { text: "No existing patient information found.", user: false }]);
                        setCurrentStep('userInput');
                        setMessages([...messages, { text: "Patient's chief complaint?", user: false }]);
                    } 
                } else if (input.toLowerCase() === 'yes') {
                    setCurrentStep('Rehab');
                    setMessages([...messages, { text: "Please enter the diagnostic assessment ID:", user: false }]);
                }
            } 
            if (currentStep === 'awaitingExistingInfoResponse') {
                if (input.toLowerCase() === 'yes') {
                    console.log("Current step is useExistingInfo");
                    console.log("Sending request to /use_existing_info with data:");
                    response = await axios.post('http://127.0.0.1:5011/use_existing_info');
                        console.log("Response from /use_existing_info:", response.data);
                        setMessages([...messages, { text: input, user: true },{ text: `1: patient's condition and suggest suspected diagnoses \n${response.data.diagnosis}\n`, user: false }, { text: response.data.examination, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                    setCurrentStep('complete');
                } else if (input.toLowerCase() === 'no') {
                    console.log("Current step is userInput");
                    setCurrentStep('userInput');
                    setMessages([...messages, { text: "Patient's chief complaint?", user: false }]);
                }             
            } 
            if (currentStep === 'userInput') {
                const currentQuestion = questions[Object.keys(patientInfo).length];
                if (currentQuestion.validator(input)) {
                    const newPatientInfo = { ...patientInfo, [currentQuestion.key]: input };
                    setPatientInfo(newPatientInfo);
                    if (Object.keys(newPatientInfo).length === questions.length) {
                        console.log("Sending request to /user_input with data:", { patient_info: newPatientInfo });
                        response = await axios.post('http://127.0.0.1:5011/user_input', { patient_info: newPatientInfo });
                            console.log("Response from /user_input:", response.data);
                            setMessages([...messages, { text: input, user: true },{ text: `1: patient's condition and suggest suspected diagnoses \n${response.data.diagnosis}\n`, user: false }, { text: response.data.examination, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                        setCurrentStep('complete');
                    } else {
                        setMessages([...messages, { text: input, user: true }, { text: questions[Object.keys(newPatientInfo).length].question, user: false }]);
                    }
                } else {
                    setMessages([...messages, { text: "Invalid input. Please try again.", user: false }]);
                }
            }
            if (currentStep === 'Rehab') {
                response = await axios.post('http://127.0.0.1:5011/Check_diagnosis_id', { diagnosis_id: input });
                console.log(response.data);
                if (response.data.existing_file) {
                    setCurrentStep('File_exists');
                } else {
                    setCurrentStep('File_not_exists');
                }
                setDiagnosis_id(response.data.diagnosis_id);
                setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false }]);
            }
            if (currentStep === 'File_exists') {
                response = await axios.post('http://127.0.0.1:5011/File_exists', { 'diagnosis_id': diagnosis_id});
                const scores = response.data.scores;
                response = await axios.post('http://127.0.0.1:5011/Input_item_scores', { 'scores': scores, 'diagnosis_id': diagnosis_id});
                setDecreased_items(response.data.decreased_items);
                setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false }]);
                setCurrentStep('Get_patient_info');                 
            }
            if (currentStep === 'File_not_exists') {
                const scores = [];
                for (let i = 1; i <= 17; i++) {
                    while (true) {
                        try {
                            const score = parseFloat(prompt(`Enter the score for Item ${i}: `));
                            if (isNaN(score)) throw new Error("Invalid number");
                            scores.push(score);
                            break;
                        } catch (error) {
                            alert("Please enter a valid number.");
                        }
                    }
                }
                response = await axios.post('http://127.0.0.1:5011/Input_item_scores', { 'scores': scores, 'diagnosis_id': diagnosis_id});
                console.log("Scores:", scores);
                setDecreased_items(response.data.decreased_items);
                setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false }]);
                setCurrentStep('Get_patient_info');      
            }
            if (currentStep === 'Get_patient_info') {
                response = await axios.post('http://127.0.0.1:5011/Get_patient_info', { 'diagnosis_id': diagnosis_id});
                setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false }]);
                console.log(response.data.patient_info);
                if (response.data.patient_info.length===0) {
                    setCurrentStep('Patient_info_not_exists');
                } else {
                    setPatientInfoTemp(response.data.patient_info);
                    setCurrentStep('Patient_info_exists');
                }
            }
            if (currentStep === 'Patient_info_exists') {
                response =await axios.post('http://127.0.0.1:5011/Get_rehabilitation_evaluation', { 'decreased_items': decreased_items, 'patient_info': patientInfoTemp})
                setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                setCurrentStep('complete');
            }
            if (currentStep === 'Patient_info_not_exists') {
                const patient_info_temp = [];
                const temp_1 = prompt(`Diagnosis: `);
                patient_info_temp.push(temp_1);
                const temp_2 = prompt(`Patient's disability (write your main difficulty): `);
                patient_info_temp.push(temp_2);
                const temp_3 = prompt(`Functional Evaluation (Only CUE-T supported): `);
                patient_info_temp.push(temp_3);
                const temp_4 = prompt(`Newly acquired symptoms: `);
                patient_info_temp.push(temp_4);
                const [i, response]= await Promise.all([
                    axios.post('http://127.0.0.1:5011/Update_patient_info', { 'patient_info': patient_info_temp, 'diagnosis_id': diagnosis_id}),
                    axios.post('http://127.0.0.1:5011/Get_rehabilitation_evaluation', { 'decreased_items': decreased_items, 'patient_info': patient_info_temp})
                ]
                );                
                setMessages([...messages, { text: input, user: true },{ text: response.data.result, user: false },{ text: "All questions completed. Send any keys to restart.", user: false }]);
                setCurrentStep('complete');
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

    return (
        <div>
            {currentStep === 'initial' && messages.length === 0 && (
                <div>Do you have a diagnostic assessment? (yes/no)</div>
            )}
            <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
            <div>
                {messages.map((message, index) => (
                    <div key={index} style={{color: message.user ? 'blue' : 'green'}}>
                        {message.text}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Chatbot;