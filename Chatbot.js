import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [currentStep, setCurrentStep] = useState('initial');
    const [patientInfo, setPatientInfo] = useState({});

    const sendMessage = async () => {
        try {
            let response;
            if (currentStep === 'initial') {
                setMessages([...messages, { text: "Do you have a diagnostic assessment? (yes/no)", user: false }]);
                response = await axios.post('http://127.0.0.1:5011/check_diagnosis', { has_diagnosis: input });
                console.log("Response from /check_diagnosis:", response.data);
                if (response.data.hasExistingInfo) {
                    setMessages([...messages, { text: "Found existing patient information. Would you like to use it? (yes/no)", user: false }]);
                    setCurrentStep('useExistingInfo');
                } else {
                    setMessages([...messages, { text: response.data.result, user: false }]);
                    setCurrentStep('complete');
                }
            } else if (currentStep === 'useExistingInfo') {
                const useExisting = input.toLowerCase() === 'yes';
                console.log("Sending request to /use_existing_info with data:", { use_existing: useExisting });
                response = await axios.post('http://127.0.0.1:5011/use_existing_info', { use_existing: useExisting });
                console.log("Response from /use_existing_info:", response.data);
                setMessages([...messages, { text: input, user: true }, { text: response.data.diagnosis, user: false }, { text: response.data.examination, user: false }]);
                setCurrentStep('complete');
            } else if (currentStep === 'userInput') {
                const newPatientInfo = { ...patientInfo, [Object.keys(patientInfo).length]: input };
                setPatientInfo(newPatientInfo);
                if (Object.keys(newPatientInfo).length === 5) { // Assuming 5 questions
                    console.log("Sending request to /user_input with data:", { patient_info: newPatientInfo });
                    response = await axios.post('http://127.0.0.1:5011/user_input', { patient_info: newPatientInfo });
                    console.log("Response from /user_input:", response.data);
                    setMessages([...messages, { text: input, user: true }, { text: response.data.diagnosis, user: false }, { text: response.data.examination, user: false }]);
                    setCurrentStep('complete');
                } else {
                    setMessages([...messages, { text: input, user: true }, { text: "Please provide the next piece of patient information:", user: false }]);
                }
            }
            setInput('');
        } catch (error) {
            console.error('Error:', error);
            setMessages([...messages, { text: "An error occurred. Please try again.", user: false }]);
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