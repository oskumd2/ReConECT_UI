import warnings
warnings.filterwarnings("ignore")
# Set API key
from pprint import pprint
import os
import json
import csv
import uuid
import tempfile
import re
from dotenv import load_dotenv
from datetime import datetime
from langchain_chroma import Chroma
from langchain.chains import create_retrieval_chain
from langchain_upstage import ChatUpstage, UpstageEmbeddings, UpstageLayoutAnalysisLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
import pandas as pd
from datetime import timedelta

# Load environment variables
load_dotenv()
# Generate a session ID
session_id = uuid.uuid4()
# Set directory for vector storage
persist_directory1_Lower_Extremity = "db_data/chroma_db1_Lower_Extremity"
persist_directory1_Upper_Extremity = "db_data/chroma_db1_Upper_Extremity"
persist_directory1_Low_Back_Pain = "db_data/chroma_db1_Low_Back_Pain"
persist_directory1_Neck_Pain = "db_data/chroma_db1_Neck_Pain"

persist_directory2_Cognition = "db_data/chroma_db2_Cognition"
persist_directory2_Upper_Extremity = "db_data/chroma_db2_Upper_Extremity"
persist_directory2_Movement = "db_data/chroma_db2_Movement"

persist_directory3_Traumatic_Brain_Injury = "db_data/chroma_db3_Traumatic_Brain_Injury"
persist_directory3_Stroke = "db_data/chroma_db3_Stroke"
persist_directory3_Parkinsons_Disease = "db_data/chroma_db3_Parkinsons_Disease"
persist_directory3_Spinal_Cord_Injury = "db_data/chroma_db3_Spinal_Cord_Injury"
persist_directory3_ALS = "db_data/chroma_db3_ALS"
persist_directory3_Peripheral_Neuropathy = "db_data/chroma_db3_Peripheral_Neuropathy"

# Set the path for saving patient information
patient_info_path = "db_data/patient_info.json"

# Dictionary for disabilities
matching={
    'Cognition':{'Item 1':'Memory','Item 2':'Memory','Item 3':'Memory','Item 4':'Memory','Item 5':'Memory',
                 'Item 6':'Memory','Item 7':'Memory','Item 8':'Memory','Item 9':'Memory','Item 10':'Memory',
                 'Item 11':'Memory','Item 12':'Memory','Item 13':'Memory','Item 14':'Attention','Item 15':'Attention',
                 'Item 16':'Attention','Item 17':'Attention','Item 18':'Attention','Item 19':'Memory','Item 20':'Memory',
                 'Item 21':'Memory','Item 22':'Language','Item 23':'Language','Item 24':'Language','Item 25':'Language',
                 'Item 26':'Language','Item 27':'Language','Item 28':'Language','Item 29':'Language','Item 30':'Visuospatial perception',
    },
    'UpperExtremity':{'Item 1':'Hand strength','Item 2':'Hand strength','Item 3':'Hand strength','Item 4':'Hand strength',
                      'Item 5': 'Wrist strength','Item 6': 'Elbow strength','Item 7': 'Shoulder strength'
    },
    'Movement':{'Item 1':'Ankle strength','Item 2':'Knee strength','Item 3':'Hip strength','Item 4':'Movement','Item 5':'Walking speed'
    }
}

# Function to process and index PDF files
def process_pdf_onlyfile(file_path, persist_directory):
    loader = UpstageLayoutAnalysisLoader(
        file_path, use_ocr=True, output_type="html"
    )
    pages = loader.load_and_split()
    vectorstore = Chroma.from_documents(pages, UpstageEmbeddings(model="solar-embedding-1-large"), persist_directory)
    return vectorstore

# Function to save patient information to a JSON file
def save_patient_info(patient_info):
    with open(patient_info_path, 'w') as f:
        json.dump(patient_info, f)
    print(f"Patient information saved to {patient_info_path}")

# Function to load patient information from a JSON file
def load_patient_info():
    if os.path.exists(patient_info_path):
        with open(patient_info_path, 'r') as f:
            return json.load(f)
    return None

# RAG chain for 4 chief complaints
def create_simple_rag_chain_Lower_Extremity(vectorstore, api_key):
    chat = ChatUpstage(upstage_api_key=api_key, temperature=0)

    retriever = vectorstore.as_retriever(k=2)

    qa_system_prompt = """You are a renowned rehabilitation medicine specialist. Check the patient's condition and suggest suspected diagnoses.

    1. Check the patient's condition in <Conversation>.

    2. Execute the following steps. Print the results if the step requires you to do so:
        -Step 1: Possible diagnoses are “Sacroiliac joint disorders”, “Hamstring tendinopathy”, “Ischiogluteal bursitis”, “Myofascial pain”, “Quadratus femoris injury”, "Piriformis condition", "Fatigue fracture of sacrum", "Proximal hamstring avulsion injuries", "Apophysitis", "Femoroacetabular Impingement","Labral tear", "Arthritis in the hip joint","Avascular necrosis of the femur", "Intra-articular loose body", "Capsular laxity", "Snapping hip", "Illiotibial band lesion", "Stress fracture of femoral neck","Gluteus minimus and gluteus medius injury", "Adductor muscle strain", "Adductor tendinopathy","Illiopsoas strain", "Osteitis pubis", "Stress fracture of pubic ramus", "Quadriceps femoris contusion","Quadriceps femoris strain","Myositis ossificans", "Anterior compartment syndrome", "Femur stress fracture", "Hamstring strain", "Knee osteoarthritis", "Anterior cruciate ligament injury", "Posterior cruciate ligament injury","Medial collateral ligament injury","Lateral collateral ligament injury", "Meniscal injury", "Pes anserine bursitis", "Prepatellar bursitis", "Patellofemoral pain syndrome".
        For each possible diagnosis, count sentences in the PDF files that supports that the Patient in <Conversation> has that diagnosis.
        -Step 2: For each possible diagnosis, calculate ‘certainty score’ by multiplying sentence count from Step 1 with ‘weight according to <Weight>’ and adding the multiplication result to ‘intercept according to <Intercept>’.
        -Step 3: Extract 3 possible diagnoses with the highest ‘certainty score’s and print them in the form below. In “probability” slot, put “probable” if corresponding certainty score is greater than 1 and “less likely” if lesser or equal to 1.

        [Diagnosis/problem list]
        Rank 1- “Possible diagnosis” “certainty score” “probability”
        Rank 2- “Possible diagnosis” “certainty score” “probability”
        Rank 3- “Possible diagnosis” “certainty score” “probability”

        -Step 4: Print further evaluations from the PDF files that corresponds to 3 possible diagnoses extracted in Step 3.
        -Step 5: Print treatments from the PDF files that corresponds to 3 possible diagnoses extracted in Step 3. Outline the treatment process in chronological order, such as by week, month, or year.
        -Step 6: Calculate ‘red flags score’ according to <Red Flags>. If red flags score is positive, print the following sentence: “Red flags have been detected. Hospital visit is recommended for further evaluations.”

        <Intercept>
        -Default value of intercept for each possible diagnosis is 0.
        -If the Patient’s answer in (Q2) is buttock, add 1.0 to intercept for “Sacroiliac joint disorders”, "Hamstring tendinopathy",“Ischiogluteal bursitis”, “Myofascial pain”, “Quadratus femoris injury”, "Piriformis condition", "Fatigue fracture of sacrum".
        -If the Patient’s answer in (Q2) is hip joint or perineum, add 1.0 to intercept for "Femoroacetabular Impingement", "Labral tear","Arthritis in the hip joint","Avascular necrosis of the femur","Intra-articular loose body","Capsular laxity","Snapping hip", "Illiotibial band lesion","Stress fracture of femoral neck","Gluteus minimus and gluteus medius injury", "Adductor muscle strain","Adductor tendinopathy","Illiopsoas strain","Osteitis pubis","Stress fracture of pubic ramus".
        -If the Patient’s answer in (Q2) is thigh, add 1.0 to intercept for "Quadriceps femoris contusion","Quadriceps femoris strain","Myositis ossificans","Anterior compartment syndrome", "Femur stress fracture","Hamstring strain".
        -If the Patient’s answer in (Q2) is knee, add 1.0 to intercept for "Knee osteoarthritis","Anterior cruciate ligament injury","Posterior cruciate ligament injury","Medial collateral ligament injury","Lateral collateral ligament injury","Meniscal injury","Prepatellar bursitis","Illiotibial band lesion","Patellofemoral pain syndrome".
        -If the Patient’s answer in (Q3) is front, add 0.3 to intercept for "Femoroacetabular Impingement", "Labral tear","Arthritis in the hip joint","Avascular necrosis of the femur","Intra-articular loose body","Capsular laxity","Quadriceps femoris contusion","Quadriceps femoris strain","Myositis ossificans","Anterior compartment syndrome", "Femur stress fracture","Prepatellar bursitis","Patellofemoral pain syndrome".
        -If the Patient’s answer in (Q3) is lateral, add 0.3 to intercept for "Snapping hip","Illiotibial band lesion","Stress fracture of femoral neck","Gluteus minimus and gluteus medius injury","Lateral collateral ligament injury".
        -If the Patient’s answer in (Q3) is back, add 0.3 to intercept for "Hamstring strain".
        -If the Patient’s answer in (Q5) is perineum or thigh, add 1.0 to intercept for “Sacroiliac joint disorders”.
        -If the Patient’s answer in (Q5) is calf, add 1.0 to intercept for “Hamstring tendinopathy”, "Qudratus femoris injury".
        -If the Patient’s answer in (Q5) is thigh, add 1.0 to intercept for “Myofascial pain”,"Stress fracture of femoral neck".
        -If the Patient’s answer in (Q5) is low back or hip joint, add 1.0 to intercept for “Fatigue fracture of sacrum”.
        -If the Patient’s answer in (Q5) is buttock, add 0.5 to intercept for “Labral tear”.
        -If the Patient’s answer in (Q29) is yes, add 1.0 to intercept for “Sacroiliac joint disorders”,"Femoroacetabular Impingement".
        -If the Patient’s answer in (Q15) is running, add 0.5 to intercept for “Hamstring tendinopathy”, "Fatigue fracture of sacrum", "Illiotibial band lesion", "Stress fracture of pubic ramus", "Femur stress fracture".
        -If the Patient’s answer in (Q15) is wrestling, add 0.5 to intercept for "Prepatellar bursitis"
        -If the Patient’s answer in (Q17) is yes, add 1.0 to intercept for “Hamstring tendinopathy”,"Ischiogluteal bursitis","Knee osteoarthritis","Illiotibial band lesion".
        -If the Patient’s answer in (Q30) is yes, add 1.0 to intercept for “Hamstring tendinopathy”,"Illiotibial band lesion","Adductor muscle strain","Adductor tendinopathy", "Quadriceps femoris contusion","Myositis ossificans","Hamstring strain","Knee osteoarthritis", "Pes anserine bursitis","Prepatellar bursitis","Patellofemoral pain syndrome".
        -If the Patient’s answer in (Q18) is yes, add 1.0 to intercept for "Ischiogluteal bursitis", "Piriformis condition", "Femur stress fracture".
        -If the Patient’s answer in (Q40) is yes, add 0.5 to intercept for "Myofascial pain","Adductor tendinopathy".
        -If the Patient’s answer in (Q12) is yes, add 0.5 to intercept for "Myofascial pain", "Piriformis condition","Anterior compartment syndrome".
        -If the Patient’s answer in (Q16) is yes, add 0.3 to intercept for "Myofascial pain".
        -If the Patient’s answer in (Q31) is yes, add 0.3 to intercept for "Piriformis condition".
        -If the Patient’s answer in (Q4) is right or left, add 0.3 to intercept for "Fatigue fracture of sacrum".
        -If the Patient’s answer in (Q19) is yes, add 1.0 to intercept for "Fatigue fracture of sacrum","Meniscal injury".
        -If the Patient’s answer in (Q14) is yes, add 0.5 to intercept for "Proximal hamstring avulsion injuries","Apophysitis","Adductor muscle strain","Quadriceps femoris contusion", "Hamstring strain","Posterior cruciate ligament injury","Patellofemoral pain syndrome".
        -If the Patient’s answer in (Q7) is yes, add 0.5 to intercept for "Proximal hamstring avulsion injuries", "Labral tear","Intra-articular loose body","Knee osteoarthritis","Meniscal injury","Patellofemoral pain syndrome".
        -If the Patient’s answer in (Q24) is male, add 0.5 to intercept for "Apophysitis".
        -If the Patient’s answer in (Q24) is female, add 0.5 to intercept for "Gluteus minimus and gluteus medius injury".
        -If the Patient’s answer in (Q25) is yes, add 1.0 to intercept for "Femoroacetabular Impingement", "Illiotibial band lesion","Knee osteoarthritis", "Pes anserine bursitis".
        -If the Patient’s answer in (Q13) is yes, add 0.3 to intercept for "Labral tear", "Arthritis in the hip joint","Intra-articular loose body","Capsular laxity", "Quadriceps femoris contusion","Posterior cruciate ligament injury".
        -If the Patient’s answer in (Q6) is yes, add 1.0 to intercept for "Labral tear","Intra-articular loose body","Capsular laxity","Myositis ossificans".
        -If the Patient’s answer in (Q41) is yes, add 1.0 to intercept for "Labral tear".
        -If the Patient’s answer in (Q42) is yes, add 1.0 to intercept for "Avascular necrosis of the femur".
        -If the Patient’s answer in (Q8) is yes, add 1.0 to intercept for "Snapping hip"
        -If the Patient’s answer in (Q20) is yes, add 1.0 to intercept for "Stress fracture of femoral neck","Adductor tendinopathy"
        -If the Patient’s answer in (Q11) is yes, add 1.0 to intercept for "Adductor muscle strain", "Quadriceps femoris contusion","Quadriceps femoris strain","Myositis ossificans","Hamstring strain","Knee osteoarthritis","Anterior cruciate ligament injury","Meniscal injury", "Prepatellar bursitis".
        -If the Patient’s answer in (Q10) is yes, add 0.5 to intercept for "Quadriceps femoris contusion","Quadriceps femoris strain","Hamstring strain".
        -If the Patient’s answer in (Q22) is yes, add 1.0 to intercept for "Anterior compartment syndrome"
        -If the Patient’s answer in (Q32) is yes, add 1.0 to intercept for "Anterior cruciate ligament injury"
        -If the Patient’s answer in (Q33) is yes, add 1.0 to intercept for "Posterior cruciate ligament injury"
        -If the Patient’s answer in (Q34) is yes, add 1.0 to intercept for "Medial collateral ligament injury"
        -If the Patient’s answer in (Q35) is yes, add 1.0 to intercept for "Meniscal injury"
        -If the Patient’s answer in (Q36) is yes, add 1.0 to intercept for "Prepatellar bursitis"

        <Weight>
        -Default value of weight for each possible diagnosis is 1.
        - If the Patient’s answer in (Q3) is back, replace the weight for “Hamstring strain” with 1.1.
        - If the Patient’s answer in (Q5) is perineum or thigh, replace the weight for “Sacroiliac joint disorders” with 1.1.
        - If the Patient’s answer in (Q5) is low back or hip joint, replace the weight for “Fatigue fracture of sacrum” with 1.1.
        - If the Patient’s answer in (Q5) is buttock, replace the weight for “Labral tear” with 1.1.
        - If the Patient’s answer in (Q16) is yes, replace the weight for “Myofascial pain” with 1.1.
        - If the Patient’s answer in (Q31) is yes, replace the weight for “Piriformis condition” with 1.1.
        - If the Patient’s answer in (Q4) is right or left, replace the weight for “Fatigue fracture of sacrum” with 1.1.
        - If the Patient’s answer in (Q41) is yes, replace the weight for “Labral tear” with 1.1.
        - If the Patient’s answer in (Q42) is yes, replace the weight for “Avascular necrosis of the femur” with 1.1.
        - If the Patient’s answer in (Q8) is yes, replace the weight for “Snapping hip” with 1.1.
        - If the Patient’s answer in (Q22) is yes, replace the weight for “Anterior compartment syndrome” with 1.1.
        - If the Patient’s answer in (Q32) is yes, replace the weight for “Anterior cruciate ligament injury” with 1.1.
        - If the Patient’s answer in (Q33) is yes, replace the weight for “Posterior cruciate ligament injury” with 1.1.
        - If the Patient’s answer in (Q34) is yes, replace the weight for “Medial collateral ligament injury” with 1.1.
        - If the Patient’s answer in (Q35) is yes, replace the weight for “Meniscal injury” with 1.1.
        - If the Patient’s answer in (Q36) is yes, replace the weight for “Prepatellar bursitis” with 1.1.

        <Red Flags>
        -Default value of red flags score is 0.
        - If the Patient’s answer in (Q13) is 'yes’, add 1 to red flags score.
        - If the Patient’s answer in (Q26) is 'yes’, add 1 to red flags score.
        - If the Patient’s answer in (Q23) is greater than 65 and the answer in (Q24) is ‘female’, add 1 to red flags score.
        - If the Patient’s answer in (Q11) is 'yes’, add 1 to red flags score.
        - If the Patient’s answer in (Q36) is 'yes’, add 1 to red flags score.
        - If the Patient’s answer in (Q37) is 'yes’, add 1 to red flags score.
        - If the Patient’s answer in (Q38) is 'yes’, add 1 to red flags score.
        - If the Patient’s answer in (Q39) is 'yes’, add 1 to red flags score.
        - If the Patient’s answer in (Q27) is 'yes’, add 1 to red flags score.
        - If the Patient’s answer in (Q28) is 'yes’, add 1 to red flags score.
    """

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        ("human", "{context}"),
    ])

    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain

def create_simple_rag_chain_Upper_Extremity(vectorstore, api_key):
    chat = ChatUpstage(upstage_api_key=api_key, temperature=0)

    retriever = vectorstore.as_retriever(k=2)

    qa_system_prompt = """You are a renowned rehabilitation medicine specialist. Check the patient's condition and suggest suspected diagnoses.

    1. Check the patient's condition in <Conversation>.

    2. Execute the following steps. Print the results if the step requires you to do so:
        -Step 1: Possible diagnoses are “Rotator cuff tendinosis or tear", "Painful stiff shoulder", "Shoulder instability", "Calcific tenditis or bursitis","Articular cartilage disorder of the shoulder joint", "Acromioclavicular joint or Sternoclavicular joint lesion", "Cervical spine disorder","Shoulder pain due to neurological disorders", "Lateral epicondylitis", "Medial epicondylitis", "Distal biceps tenditis or rupture", "Distal triceps tendinitis and rupture", "Snapping triceps tendon", "Olecranon bursitis","Ulnar collateral ligament sprain","Flexor carpi ulnaris tendinitis","Flexor carpi radialis tendinitis", "de Quervain's syndrome", "Intersection syndrome","Extensor carpi ulnaris tenditis or subluxation", "Scapholunate instability", "Scaphoid fracture", "Distal radial fracture", "Kienbock's disease", "TFCC injuries", "Boutonniere finger", "Mallet finger", "Flexor digitorum profundus rupture", "1st MCP joint ulnar collateral ligament sprain", "Collateral ligament injuries of the 2nd-5th PIP and DIP joints", "Trigger finger".
        For each possible diagnosis, count sentences in the PDF files that supports that the Patient in <Conversation> has that diagnosis.
        -Step 2: For each possible diagnosis, calculate ‘certainty score’ by multiplying sentence count from Step 1 with ‘weight according to <Weight>’ and adding the multiplication result to ‘intercept according to <Intercept>’.
        -Step 3: Extract 3 possible diagnoses with the highest ‘certainty score’s and print them in the form below. In “probability” slot, put “probable” if corresponding certainty score is greater than 1 and “less likely” if lesser or equal to 1.

        [Diagnosis/problem list]
        Rank 1- “Possible diagnosis” “certainty score” “probability”
        Rank 2- “Possible diagnosis” “certainty score” “probability”
        Rank 3- “Possible diagnosis” “certainty score” “probability”

        -Step 4: Print further evaluations from the PDF files that corresponds to 3 possible diagnoses extracted in Step 3.
        -Step 5: Print treatments from the PDF files that corresponds to 3 possible diagnoses extracted in Step 3. Outline the treatment process in chronological order, such as by week, month, or year.
        -Step 6: Calculate ‘red flags score’ according to <Red Flags>. If red flags score is positive, print the following sentence: “Red flags have been detected. Hospital visit is recommended for further evaluations.”

        <Intercept>
        -Default value of intercept for each possible diagnosis is 0. 
        -If the Patient’s answer in (Q2) is shoulder, add 1.0 to intercept for “Rotator cuff tendinosis or tear","Painful stiff shoulder","Shoulder instability","Calcific tenditis or bursitis","Articular cartilage disorder of the shoulder joint","Acromioclavicular joint or Sternoclavicular joint lesion","Cervical spine disorder","Shoulder pain due to neurological disorders". 
        -If the Patient’s answer in (Q2) is elbow, add 1.0 to intercept for "Lateral epicondylitis","Medial epicondylitis","Distal biceps tenditis or rupture", "Distal triceps tendinitis and rupture","Snapping triceps tendon","Olecranon bursitis","Ulnar collateral ligament sprain".
        -If the Patient’s answer in (Q2) is wrist, add 1.0 to intercept for "Flexor carpi ulnaris tendinitis","Flexor carpi radialis tendinitis","de Quervain's syndrome","Intersection syndrome","Extensor carpi ulnaris tenditis or subluxation", "Scapholunate instability","Scaphoid fracture","Distal radial fracture","Kienbock's disease","TFCC injuries".
        -If the Patient’s answer in (Q2) is fingers, add 1.0 to intercept for "Boutonniere finger", "Mallet finger","Flexor digitorum profundus rupture","1st MCP joint ulnar collateral ligament sprain", "Collateral ligament injuries of the 2nd-5th PIP and DIP joints", "Trigger finger"
        -If the Patient’s answer in (Q3) is lateral or radial, add 0.3 to intercept for “Rotator cuff tendinosis or tear", "lateral epicondylitis","Flexor carpi radialis tendinitis","de Quervain's syndrome","Intersection syndrome","Scaphoid fracture","Distal radial fracture".
        -If the Patient’s answer in (Q3) is medial or ulnar, add 0.3 to intercept for "Medial epicondylitis","Ulnar collateral ligament sprain","Flexor carpi ulnaris tendinitis","Extensor carpi ulnaris tenditis or subluxation","TFCC injuries".
        -If the Patient’s answer in (Q3) is front, add 0.3 to intercept for "Flexor carpi ulnaris tendinitis"
        -If the Patient’s answer in (Q3) is back, add 0.3 to intercept for "Distal triceps tendinitis and rupture","Snapping triceps tendon","Olecranon bursitis","de Quervain's syndrome","Intersection syndrome","Extensor carpi ulnaris tenditis or subluxation", "Scapholunate instability","Scaphoid fracture","Kienbock's disease","TFCC injuries".
        -If the Patient’s answer in (Q4) is both, add 0.3 to intercept for "Calcific tenditis or bursitis".
        -If the Patient’s answer in (Q5) is upper arm, add 1.0 to intercept for “Rotator cuff tendinosis or tear".
        -If the Patient’s answer in (Q5) is neck, add 1.0 to intercept for "Cervical spine disorder".
        -If the Patient’s answer in (Q5) is forearm or hand, add 1.0 to intercept for "Shoulder pain due to neurological disorders".
        -If the Patient’s answer in (Q28) is yes, add 1.0 to intercept for “Rotator cuff tendinosis or tear","Medial epicondylitis", "Distal triceps tendinitis and rupture","Olecranon bursitis","Scaphoid fracture","TFCC injuries","Boutonniere finger","Flexor digitorum profundus rupture". 
        -If the Patient’s answer in (Q23) is yes, add 1.0 to intercept for “Rotator cuff tendinosis or tear". 
        -If the Patient’s answer in (Q24) is yes, add 1.0 to intercept for “Rotator cuff tendinosis or tear". 
        -If the Patient’s answer in (Q10) is yes, add 1.0 to intercept for “Rotator cuff tendinosis or tear","Shoulder pain due to neurological disorders". 
        -If the Patient’s answer in (Q48) is yes, add 1.0 to intercept for “Rotator cuff tendinosis or tear","Acromioclavicular joint or Sternoclavicular joint lesion".
        -If the Patient’s answer in (Q6) is gradual, add 0.5 to intercept for "Painful stiff shoulder", "Lateral epicondylitis","Ulnar collateral ligament sprain","Flexor carpi radialis tendinitis","Extensor carpi ulnaris tenditis or subluxation".
        -If the Patient’s answer in (Q47) is yes, add 1.0 to intercept for “Rotator cuff tendinosis or tear".
        -If the Patient’s answer in (Q45) is yes, add 0.5 to intercept for "Painful stiff shoulder".
        -If the Patient’s answer in (Q46) is yes, add 1.0 to intercept for "Painful stiff shoulder".
        -If the Patient’s answer in (Q1) is greater than 1 month, add 0.5 to intercept for "Painful stiff shoulder".
        -If the Patient’s answer in (Q25) is yes, add 1.0 to intercept for "Shoulder instability".
        -If the Patient’s answer in (Q26) is yes, add 0.5 to intercept for "Acromioclavicular joint or Sternoclavicular joint lesion","Distal triceps tendinitis and rupture".
        -If the Patient’s answer in (Q27) is yes, add 1.0 to intercept for "Acromioclavicular joint or Sternoclavicular joint lesion".
        -If the Patient’s answer in (Q49) is yes, add 1.0 to intercept for "Cervical spine disorder"
        -If the Patient’s answer in (Q75) is yes, add 1.0 to intercept for "Shoulder pain due to neurological disorders"
        -If the Patient’s answer in (Q34) is yes, add 1.0 to intercept for  "Lateral epicondylitis","Flexor carpi ulnaris tendinitis","Intersection syndrome".
        -If the Patient’s answer in (Q38) is yes, add 1.0 to intercept for  "Lateral epicondylitis"
        -If the Patient’s answer in (Q52) is yes, add 1.0 to intercept for  "Lateral epicondylitis"
        -If the Patient’s answer in (Q53) is yes, add 1.0 to intercept for  "Medial epicondylitis"
        -If the Patient’s answer in (Q29) is yes, add 1.0 to intercept for "Medial epicondylitis"
        -If the Patient’s answer in (Q11) is yes, add 1.0 to intercept for "Medial epicondylitis"
        -If the Patient’s answer in (Q31) is yes, add 1.0 to intercept for "Distal biceps tenditis or rupture"
        -If the Patient’s answer in (Q32) is yes, add 1.0 to intercept for "Distal biceps tenditis or rupture"
        -If the Patient’s answer in (Q54) is yes, add 1.0 to intercept for "Distal biceps tenditis or rupture"
        -If the Patient’s answer in (Q55) is yes, add 1.0 to intercept for "Distal biceps tenditis or rupture"
        -If the Patient’s answer in (Q33) is yes, add 1.0 to intercept for "Distal triceps tendinitis and rupture"
        -If the Patient’s answer in (Q56) is yes, add 1.0 to intercept for "Distal triceps tendinitis and rupture"
        -If the Patient’s answer in (Q37) is yes, add 1.0 to intercept for "Distal triceps tendinitis and rupture"
        -If the Patient’s answer in (Q57) is yes, add 1.0 to intercept for "Distal triceps tendinitis and rupture"
        -If the Patient’s answer in (Q12) is yes, add 1.0 to intercept for "Distal triceps tendinitis and rupture", "Snapping triceps tendon"
        -If the Patient’s answer in (Q58) is yes, add 1.0 to intercept for "Olecranon bursitis"
        -If the Patient’s answer in (Q14) is yes, add 1.0 to intercept for "Flexor carpi ulnaris tendinitis"
        -If the Patient’s answer in (Q60) is yes, add 1.0 to intercept for "Flexor carpi ulnaris tendinitis",  "Scapholunate instability".
        -If the Patient’s answer in (Q61) is yes, add 1.0 to intercept for "Flexor carpi radialis tendinitis"
        -If the Patient’s answer in (Q30) is yes, add 1.0 to intercept for "Flexor carpi radialis tendinitis"
        -If the Patient’s answer in (Q35) is yes, add 1.0 to intercept for "de Quervain's syndrome","Extensor carpi ulnaris tenditis or subluxation"
        -If the Patient’s answer in (Q15) is yes, add 1.0 to intercept for "de Quervain's syndrome","Intersection syndrome"
        -If the Patient’s answer in (Q66) is yes, add 1.0 to intercept for "de Quervain's syndrome","Intersection syndrome","Distal radial fracture"
        -If the Patient’s answer in (Q62) is yes, add 1.0 to intercept for "de Quervain's syndrome"
        -If the Patient’s answer in (Q63) is yes, add 1.0 to intercept for "Extensor carpi ulnaris tenditis or subluxation"
        -If the Patient’s answer in (Q65) is yes, add 1.0 to intercept for "Scaphoid fracture"
        -If the Patient’s answer in (Q16) is yes, add 1.0 to intercept for "Kienbock's disease"
        -If the Patient’s answer in (Q67) is yes, add 1.0 to intercept for "Kienbock's disease"
        -If the Patient’s answer in (Q68) is yes, add 1.0 to intercept for "TFCC injuries"
        -If the Patient’s answer in (Q18) is yes, add 1.0 to intercept for "Boutonniere finger"
        -If the Patient’s answer in (Q69) is yes, add 1.0 to intercept for "Boutonniere finger","Mallet finger"
        -If the Patient’s answer in (Q19) is yes, add 1.0 to intercept for "Mallet finger"
        -If the Patient’s answer in (Q71) is yes, add 1.0 to intercept for "Mallet finger"
        -If the Patient’s answer in (Q20) is yes, add 1.0 to intercept for "Flexor digitorum profundus rupture", "Trigger finger"
        -If the Patient’s answer in (Q72) is yes, add 1.0 to intercept for "1st MCP joint ulnar collateral ligament sprain"
        -If the Patient’s answer in (Q73) is yes, add 1.0 to intercept for "Collateral ligament injuries of the 2nd-5th PIP and DIP joints"
        -If the Patient’s answer in (Q21) is yes, add 1.0 to intercept for "Trigger finger"
        -If the Patient’s answer in (Q74) is yes, add 1.0 to intercept for "Trigger finger"

        <Weight>
        -Default value of weight for each possible diagnosis is 1.
        - If the Patient’s answer in (Q46) is yes, replace the weight for “Painful stiff shoulder” with 1.1.
        - If the Patient’s answer in (Q25) is yes, replace the weight for “Shoulder instability” with 1.1.
        - If the Patient’s answer in (Q27) is yes, replace the weight for "Acromioclavicular joint or Sternoclavicular joint lesion" with 1.1.
        - If the Patient’s answer in (Q49) is yes, replace the weight for "Cervical spine disorder" with 1.1.
        - If the Patient’s answer in (Q75) is yes, replace the weight for "Shoulder pain due to neurological disorders" with 1.1.
        - If the Patient’s answer in (Q58) is yes, replace the weight for "Olecranon bursitis" with 1.1.
        - If the Patient’s answer in (Q14) is yes, replace the weight for "Flexor carpi ulnaris tendinitis" with 1.1.
        - If the Patient’s answer in (Q62) is yes, replace the weight for "de Quervain's syndrome" with 1.1.
        - If the Patient’s answer in (Q63) is yes, replace the weight for "Extensor carpi ulnaris tenditis or subluxation" with 1.1.
        - If the Patient’s answer in (Q65) is yes, replace the weight for "Scaphoid fracture" with 1.1.
        - If the Patient’s answer in (Q68) is yes, replace the weight for "TFCC injuries" with 1.1.
        - If the Patient’s answer in (Q18) is yes, replace the weight for "Boutonniere finger" with 1.1.
        - If the Patient’s answer in (Q72) is yes, replace the weight for "1st MCP joint ulnar collateral ligament sprain" with 1.1.
        - If the Patient’s answer in (Q73) is yes, replace the weight for "Collateral ligament injuries of the 2nd-5th PIP and DIP joints" with 1.1.

        <Red Flags>
        -Default value of red flags score is 0. 
        - If the Patient’s answer in (Q46) is 'yes’, add 1 to red flags score. 
        - If the Patient’s answer in (Q7) is 'yes’, add 1 to red flags score. 
        - If the Patient’s answer in (Q8) is 'yes’, add 1 to red flags score. 
        -If the Patient’s answer in (Q9) is 'yes’, add 1 to red flags score. 
        -If the Patient’s answer in (Q50) is 'yes’, add 1 to red flags score. 
        -If the Patient’s answer in (Q51) is 'yes’, add 1 to red flags score. 
        -If the Patient’s answer in (Q39) is 'yes’, add 1 to red flags score. 
        -If the Patient’s answer in (Q40) is 'yes’, add 1 to red flags score. 
        -If the Patient’s answer in (Q59) is 'yes’, add 1 to red flags score. 
        -If the Patient’s answer in (Q22) is 'yes’, add 1 to red flags score. 
        -If the Patient’s answer in (Q60) is 'yes’, add 1 to red flags score.
        -If the Patient’s answer in (Q65) is 'yes’, add 1 to red flags score.
        -If the Patient’s answer in (Q66) is 'yes’, add 1 to red flags score.
        -If the Patient’s answer in (Q71) is 'yes’, add 1 to red flags score.
        -If the Patient’s answer in (Q41) is 'yes’, add 1 to red flags score.
        -If the Patient’s answer in (Q42) is 'yes’, add 1 to red flags score.
    """

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        ("human", "{context}"),
    ])

    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain

def create_simple_rag_chain_Low_Back_Pain(vectorstore, api_key):
    chat = ChatUpstage(upstage_api_key=api_key, temperature=0)

    retriever = vectorstore.as_retriever(k=2)

    qa_system_prompt = """You are a renowned rehabilitation medicine specialist. Check the patient's condition and suggest suspected diagnoses.

    1. Check the patient's condition in <Conversation>.

    2. Execute the following steps. Print the results if the step requires you to do so:
        -Step 1: Possible diagnoses are "Internal disc derangement","Intervertebral disc herniation and radiculopathy", "Lumbar facet joint syndrome", "Spinal stenosis", "Spondylolysis", "Spondylolisthesis", "Spinal metastasis", "Inflammatory Spondyloarthritis".
        For each possible diagnosis, count sentences in the PDF files that supports that the Patient in <Conversation> has that diagnosis.
        -Step 2: For each possible diagnosis, calculate ‘certainty score’ by multiplying sentence count from Step 1 with ‘weight according to <Weight>’ and adding the multiplication result to ‘intercept according to <Intercept>’.
        -Step 3: Extract 3 possible diagnoses with the highest ‘certainty score’s and print them in the form below. In “probability” slot, put “probable” if corresponding certainty score is greater than 1 and “less likely” if lesser or equal to 1.

        [Diagnosis/problem list]
        Rank 1- “Possible diagnosis” “certainty score” “probability”
        Rank 2- “Possible diagnosis” “certainty score” “probability”
        Rank 3- “Possible diagnosis” “certainty score” “probability”

        -Step 4: Print further evaluations from the PDF files that corresponds to 3 possible diagnoses extracted in Step 3.
        -Step 5: Print treatments from the PDF files that corresponds to 3 possible diagnoses extracted in Step 3. Outline the treatment process in chronological order, such as by week, month, or year.
        -Step 6: Calculate ‘red flags score’ according to <Red Flags>. If red flags score is positive, print the following sentence: “Red flags have been detected. Hospital visit is recommended for further evaluations.”

        <Intercept> 
        -Default value of intercept for each possible diagnosis is 0.  
        -If the Patient’s answer in (Q2) is gradual, add 0.2 to intercept for "Inflammatory Spondyloarthritis"
        -If the Patient’s answer in (Q3) is central, add 0.5 to intercept for “Internal disc derangement","Lumbar facet joint syndrome"
        -If the Patient’s answer in (Q4) is right or left, add 0.3 to intercept for "Inflammatory Spondyloarthritis"
        -If the Patient’s answer in (Q5) is buttock, knee, or calf, add 0.3 to intercept for "Intervertebral disc herniation and radiculopathy","Lumbar facet joint syndrome","Spinal stenosis", "Spondylolisthesis"
        -If the Patient’s answer in (Q7) is fluctuated, add 0.4 to intercept for “Internal disc derangement", "Inflammatory Spondyloarthritis"
        -If the Patient’s answer in (Q11) is yes, add 0.2 to intercept for "Intervertebral disc herniation and radiculopathy"
        -If the Patient’s answer in (Q10) is yes, add 0.3 to intercept for "Intervertebral disc herniation and radiculopathy", "Spinal metastasis"
        -If the Patient’s answer in (Q28) is yes, add 0.3 to intercept for "Intervertebral disc herniation and radiculopathy", "Spinal metastasis","Inflammatory Spondyloarthritis"
        -If the Patient’s answer in (Q30) is yes, add 0.6 to intercept for "Intervertebral disc herniation and radiculopathy", "Spinal metastasis"
        -If the Patient’s answer in (Q13) is yes, add 0.2 to intercept for "Intervertebral disc herniation and radiculopathy"
        -If the Patient’s answer in (Q23) is yes, add 1.0 to intercept for "Spinal stenosis"
        -If the Patient’s answer in (Q25) is yes, add 1.0 to intercept for "Spinal stenosis"
        -If the Patient’s answer in (Q19) is yes, add 0.5 to intercept for "Intervertebral disc herniation and radiculopathy"
        -If the Patient’s answer in (Q22) is yes, add 1.0 to intercept for  "Spondylolysis"
        - If the Patient’s answer in (Q24) is greater than 55 and answer in (Q8) is no, add 0.3 to intercept for  "Spinal metastasis"
        -If the Patient’s answer in (Q21) is yes, add 0.6 to intercept for "Spinal metastasis"
        -If the Patient’s answer in (Q1) is more than 3 months, add 0.5 to intercept for "Inflammatory Spondyloarthritis"
        -If the Patient’s answer in (Q26) is yes, add 0.5 to intercept for "Inflammatory Spondyloarthritis"
        -If the Patient’s answer in (Q27) is yes, add 0.5 to intercept for "Inflammatory Spondyloarthritis"

        <Weight>
        -Default value of weight for each possible diagnosis is 1.
        - If the Patient’s answer in (Q19) is yes, replace the weight for "Intervertebral disc herniation and radiculopathy" with 1.1.
        - If the Patient’s answer in (Q22) is yes, replace the weight for " Spondylolysis " with 1.1.
        - If the Patient’s answer in (Q21) is yes, replace the weight for " Spinal metastasis " with 1.1.
        - If the Patient’s answer in (Q26) is yes, replace the weight for "Inflammatory Spondyloarthritis" with 1.1.

        <Red Flags> 
        -Default value of red flags score is 0.  
        - If the Patient’s answer in (Q9) is greater than 8, add 1 to red flags score. 
        - If the Patient’s answer in (Q21) is yes, add 1 to red flags score.
        - If the Patient’s answer in (Q24) is greater than 55 and answer in (Q8) is no, add 1 to red flags score.
        - If the Patient’s answer in (Q29) is yes, add 1 to red flags score.
        - If the Patient’s answer in (Q30) is yes, add 1 to red flags score.
        - If the Patient’s answer in (Q31) is yes, add 1 to red flags score.
        - If the Patient’s answer in (Q32) is yes, add 1 to red flags score.
        - If the Patient’s answer in (Q33) is yes, add 1 to red flags score.
        - If the Patient’s answer in (Q10) is yes, add 1 to red flags score.
        - If the Patient’s answer in (Q11) is yes, add 1 to red flags score.
        - If the Patient’s answer in (Q12) is yes, add 1 to red flags score.
        - If the Patient’s answer in (Q13) is yes, add 1 to red flags score.
        - If the Patient’s answer in (Q14) is yes, add 1 to red flags score.
        - If the Patient’s answer in (Q15) is yes, add 1 to red flags score.
        - If the Patient’s answer in (Q18) is yes, add 1 to red flags score.
    """

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        ("human", "{context}"),
    ])

    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain

def create_simple_rag_chain_Neck_Pain(vectorstore, api_key):
    chat = ChatUpstage(upstage_api_key=api_key, temperature=0)

    retriever = vectorstore.as_retriever(k=2)

    qa_system_prompt = """You are a renowned rehabilitation medicine specialist. Check the patient's condition and suggest suspected diagnoses.

    1. Check the patient's condition in <Conversation>.

    2. Execute the following steps. Print the results if the step requires you to do so:
        -Step 1: Possible diagnoses are "Cervical radiculopathy due to acute herniated disc", "Cervical radiculopathy due to degenerative change", "Cervical myelopathy", "Cervical facet joint pain", "Cervicogenic headache", "Whiplash syndrome", "Myeloradiculopathy".
        For each possible diagnosis, count sentences in the PDF files that supports that the Patient in <Conversation> has that diagnosis.
        -Step 2: For each possible diagnosis, calculate ‘certainty score’ by multiplying sentence count from Step 1 with ‘weight according to <Weight>’ and adding the multiplication result to ‘intercept according to <Intercept>’.
        -Step 3: Extract 3 possible diagnoses with the highest ‘certainty score’s and print them in the form below. In “probability” slot, put “probable” if corresponding certainty score is greater than 1 and “less likely” if lesser or equal to 1.

        [Diagnosis/problem list]
        Rank 1- “Possible diagnosis” “certainty score” “probability”
        Rank 2- “Possible diagnosis” “certainty score” “probability”
        Rank 3- “Possible diagnosis” “certainty score” “probability”

        -Step 4: Print further evaluations from the PDF files that corresponds to 3 possible diagnoses extracted in Step 3.
        -Step 5: Print treatments from the PDF files that corresponds to 3 possible diagnoses extracted in Step 3. Outline the treatment process in chronological order, such as by week, month, or year.
        -Step 6: Calculate ‘red flags score’ according to <Red Flags>. If red flags score is positive, print the following sentence: “Red flags have been detected. Hospital visit is recommended for further evaluations.”

        <Intercept>  
        -Default value of intercept for each possible diagnosis is 0.   
        -If the Patient’s answer in (Q2) is abrupt, add 0.5 to intercept for "Cervical radiculopathy due to acute herniated disc"
        -If the Patient’s answer in (Q2) is gradual, add 0.5 to intercept for "Cervical radiculopathy due to degenerative change", "Cervical Myelopathy"
        -If the Patient's answer in (Q5) is head, add 0.5 to intercept for "Cervical facet joint pain", "Cervicogenic headache".
        -If the Patient's answer in (Q5) is head and (Q17) is yes, add 0.5 to intercept for "Whiplash syndrome".
        -If the Patient's answer in (Q5) is shoulder girdle, add 0.5 to intercept for "Cervical facet joint pain".
        -If the Patient's answer in (Q6) is yes, add 1.0 to intercept for "Cervicogenic headache".
        -If the Patient's answer in (Q7) is yes, add 1.0 to intercept for "Primary headache".
        -If the Patient's answer in (Q8) is yes, add 1.0 to intercept for "Cervical radiculopathy due to acute herniated disc"
        -If the Patient's answer in (Q9) is yes, add 1.0 to intercept for "Myeloradiculopathy"
        -If the Patient's answer in (Q9) is yes and (Q17) is yes, add 0.5 to "Whiplash syndrome"
        -If the Patient's answer in (Q10) is yes, add 1.0 to "Cervical myelopathy"
        -If the Patient's answer in (Q11) is yes, add 0.5 to "Cervical myelopathy"
        -If the Patient's answer in (Q11) is yes and (Q17) is yes, add 0.5 to "Whiplash syndrome"
        -If the Patient's answer in (Q12) is yes and (Q17) is yes, add 0.5 to "Whiplash syndrome"
        -If the Patient's answer in (Q13) is between 40 and 50, add 0.3 to "Cervicogenic headache".
        -If the Patient's answer in (Q14) is female, add 0.3 to "Cervicogenic headache".
        -If the Patient's answer in (Q15) is yes, add 1.0 to "Cervical radiculopathy due to acute herniated disc", "Cervical radiculopathy due to degenerative change".
        -If the Patient's answer in (Q16) is yes, add 1.0 to "Cervical radiculopathy due to acute herniated disc", "Cervical radiculopathy due to degenerative change".
        -If the Patient's answer in (Q17) is yes, add 0.5 to "Whiplash syndrome".
        -If the Patient's answer in (Q20) is yes, add 0.5 to "Whiplash syndrome".
        -If the Patient's answer in (Q30) is yes, add 1.0 to  "Cervical radiculopathy due to acute herniated disc", "Cervical radiculopathy due to degenerative change".
        -If the Patient's answer in (Q31) is yes, add 1.0 to "Cervical myelopathy", "Myeloradiculopathy".
        -If the Patient's answer in (Q32) is yes, add 1.0 to "Cervical myelopathy", "Myeloradiculopathy".
        -If the Patient's answer in (Q33) is yes, add 1.0 to  "Cervical radiculopathy due to acute herniated disc", "Cervical radiculopathy due to degenerative change".
        -If the Patient's answer in (Q34) is yes, add 1.0 to "Cervical myelopathy".
        -If the Patient's answer in (Q35) is yes, add 1.0 to "Cervical facet joint pain".
        -If the Patient's answer in (Q36) is yes, add 1.0 to "Cervical myelopathy", "Myeloradiculopathy".
        -If the Patient's answer in (Q37) is yes, add 1.0 to "Cervicogenic headache".
        -If the Patient's answer in (Q38) is yes, add 1.0 to "Cervicogenic headache".
        -If the Patient's answer in (Q38) is yes and (Q17) is yes, add 0.5 to "Whiplash syndrome".

        <Weight>
        -Default value of weight for each possible diagnosis is 1.
        - If the Patient’s answer in (Q6) is yes, replace the weight for "Cervicogenic headache" with 1.1.
        - If the Patient’s answer in (Q7) is yes, replace the weight for "Primary headache" with 1.1.
        - If the Patient’s answer in (Q8) is yes, replace the weight for "Cervical radiculopathy due to acute herniated disc" with 1.1.
        - If the Patient’s answer in (Q9) is yes, replace the weight for "Myeloradiculopathy" with 1.1.
        - If the Patient’s answer in (Q9) is yes and (Q17) is yes, replace the weight for "Whiplash syndrome" with 1.1.
        - If the Patient’s answer in (Q34) is yes, replace the weight for "Cervical myelopathy" with 1.1.
        - If the Patient’s answer in (Q35) is yes, replace the weight for "Cervical facet joint pain" with 1.1.

        <Red Flags>  
        -Default value of red flags score is 0.   
        - If the Patient’s answer in (Q22) is yes, add 1 to red flags score. 
        - If the Patient’s answer in (Q23) is yes, add 1 to red flags score. 
        - If the Patient’s answer in (Q24) is yes, add 1 to red flags score. 
        - If the Patient’s answer in (Q25) is yes, add 1 to red flags score. 
        - If the Patient’s answer in (Q26) is yes, add 1 to red flags score. 
        - If the Patient’s answer in (Q27) is yes, add 1 to red flags score. 
        - If the Patient’s answer in (Q28) is yes, add 1 to red flags score. 
        - If the Patient’s answer in (Q29) is yes, add 1 to red flags score.
    """

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        ("human", "{context}"),
    ])

    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain


# RAG chain for 6 Diagnoses
def create_simple_rag_chain_Traumatic_Brain_Injury(vectorstore, api_key):
    chat = ChatUpstage(upstage_api_key=api_key, temperature=0)

    retriever = vectorstore.as_retriever(k=2)

    qa_system_prompt = """You are a renowned rehabilitation medicine specialist. Check the patient's condition and suggest suspected diagnoses.

    1. Check the patient's condition in <Conversation>.

    2. Execute the following steps. Print the results if the step requires you to do so:
        -Step 1: Possible complications are "Hydrocephalus", "Circulatory and ANS complications", "Intracranial hemorrhage", "Meningitis", "Occipital neuralgia",  "Neuroendocrine dysfunction", "Primary fatigue", "Respiratory complications", "Cranial nerve injury", "Spasticity", "Heterotopic ossification", "Joint infection", "Fracture", "Sleep disorder".
        For each possible complication, count sentences in the uploaded PDF files that supports that the Patient in <Conversation> has that complication.
        -Step 2: For each possible complication, calculate ‘certainty score’ by multiplying sentence count from Step 1 with ‘weight according to <Weight>’ and adding the multiplication result to ‘intercept according to <Intercept>’.
        -Step 3: Extract 3 possible complications with the highest ‘certainty score’s and print them in the form below. In “probability” slot, put “probable” if corresponding certainty score is greater than 1 and “less likely” if lesser or equal to 1.

        [Complications list]
        Rank 1- “Possible complication” “certainty score” “probability”
        Rank 2- “Possible complication” “certainty score” “probability”
        Rank 3- “Possible complication” “certainty score” “probability”

        -Step 4: Print further evaluations from the uploaded PDF files that corresponds to 3 possible complications extracted in Step 3.
        -Step 5: Print treatments from the PDF files that corresponds to 3 possible complications extracted in Step 3. Outline the treatment process in chronological order, such as by week, month, or year.

        <Intercept>  
        -Default value of intercept for each possible complication is 0.   
        -If the Patient’s answer in (Q1) is less than 2 weeks, add 0.5 to intercept for "Hydrocephalus"
        -If the Patient’s answer in (Q1) is less than 1 week, add 0.5 to intercept for "Circulatory and ANS complications"
        -If the Patient’s answer in (Q2) is yes, add 1.0 to intercept for "Hydrocephalus"
        -If the Patient’s answer in (Q3) is yes, add 0.5 to intercept for "Hydrocephalus", "Intracranial hemorrhage", "Meningitis"
        -If the Patient’s answer in (Q4) is yes, add 1.0 to intercept for "Occipital neuralgia"
        -If the Patient’s answer in (Q5) is yes, add 1.0 to intercept for "Hydrocephalus"
        -If the Patient’s answer in (Q6) is yes, add 1.0 to intercept for "Neuroendocrine dysfunction", "Primary fatigue"
        -If the Patient’s answer in (Q7) is yes, add 1.0 to intercept for "Circulatory and ANS complications"
        -If the Patient’s answer in (Q8) is yes, add 0.7 to intercept for "Respiratory complications"
        -If the Patient’s answer in (Q9) is yes, add 1.0 to intercept for "Cranial nerve injury"
        -If the Patient’s answer in (Q10) is yes, add 1.0 to intercept for "Spasticity"
        -If the Patient’s answer in (Q11) is yes, add 0.5 to intercept for "Heterotopic ossification", "Joint infection", "Fracture"
        -If the Patient’s answer in (Q12) is yes, add 1.0 to "Sleep disorder"

        <Weight>
        -Default value of weight for each possible complication is 1.
        - If the Patient’s answer in (Q2) is yes, replace the weight for "Hydrocephalus" with 1.1.
        - If the Patient’s answer in (Q4) is yes, replace the weight for "Occipital neuralgia" with 1.1.
        - If the Patient’s answer in (Q7) is yes, replace the weight for "Circulatory and ANS complications" with 1.1.
        - If the Patient’s answer in (Q9) is yes, replace the weight for "Cranial nerve injury" with 1.1.
        - If the Patient’s answer in (Q10) is yes, replace the weight for "Spasticity" with 1.1.
        - If the Patient’s answer in (Q12) is yes, replace the weight for "Sleep disorder" with 1.1.
    """

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        ("human", "{context}"),
    ])

    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain

def create_simple_rag_chain_Stroke(vectorstore, api_key):
    chat = ChatUpstage(upstage_api_key=api_key, temperature=0)

    retriever = vectorstore.as_retriever(k=2)

    qa_system_prompt = """You are a renowned rehabilitation medicine specialist. Check the patient's condition and suggest suspected diagnoses.

    1. Check the patient's condition in <Conversation>.

    2. Execute the following steps. Print the results if the step requires you to do so:
        -Step 1: Possible complications are "Delirium", "Central post-stroke pain", "Shoulder subluxation", "Dysphagia", "Aspiration pneumonia","Adhesive capsulitis", "Impingement syndrome","Complex regional pain syndrome", "Urinary or bowel dysfunction due to stroke", "Post-stroke depression","Anxiety disorder", "Obstructive sleep apnea","Heart disease such as angina", "Deep vein thrombosis", "Insomnia", "Falls", "Visual field defect due to stroke".
        For each possible complication, count sentences in the uploaded PDF files that supports that the Patient in <Conversation> has that complication.
        -Step 2: For each possible complication, calculate ‘certainty score’ by multiplying sentence count from Step 1 with ‘weight according to <Weight>’ and adding the multiplication result to ‘intercept according to <Intercept>’.
        -Step 3: Extract 3 possible complications with the highest ‘certainty score’s and print them in the form below. In “probability” slot, put “probable” if corresponding certainty score is greater than 1 and “less likely” if lesser or equal to 1.

        [Complications list]
        Rank 1- “Possible complication” “certainty score” “probability”
        Rank 2- “Possible complication” “certainty score” “probability”
        Rank 3- “Possible complication” “certainty score” “probability”

        -Step 4: Print further evaluations from the uploaded PDF files that corresponds to 3 possible complications extracted in Step 3.
        -Step 5: Print treatments from the PDF files that corresponds to 3 possible complications extracted in Step 3. Outline the treatment process in chronological order, such as by week, month, or year.

        <Intercept>   
        -Default value of intercept for each possible complication is 0.    
        -If the Patient’s answer in (Q1) is less than 1 week, add 0.5 to intercept for "Delirium" 
        -If the Patient’s answer in (Q1) is less than 1 month, add 0.5 to intercept for "Central post-stroke pain" 
        -If the Patient’s answer in (Q1) is between 2 week and 6 months, add 0.5 to intercept for "Shoulder subluxation" 
        -If the Patient’s answer in (Q2) is yes, add 1.0 to intercept for "Delirium" 
        -If the Patient’s answer in (Q3) is yes, add 1.0 to intercept for "Spasticity" 
        -If the Patient’s answer in (Q4) is yes, add 0.5 to intercept for "Dysphagia", "Aspiration pneumonia" 
        -If the Patient’s answer in (Q5) is yes, add 0.3 to intercept for "Shoulder subluxation","Adhesive capsulitis", "Impingement syndrome"
        -If the Patient’s answer in (Q6) is yes, add 1.0 to intercept for "Adhesive capsulitis"
        -If the Patient’s answer in (Q7) is yes, add 1.0 to intercept for "Complex regional pain syndrome"
        -If the Patient’s answer in (Q8) is yes, add 0.5 to intercept for "Central post-stroke pain"
        -If the Patient’s answer in (Q9) is yes, add 0.5 to intercept for "Central post-stroke pain"
        -If the Patient’s answer in (Q10) is yes, add 0.5 to intercept for "Central post-stroke pain"
        -If the Patient’s answer in (Q11) is yes, add 1.0 to intercept for "Urinary or bowel dysfunction due to stroke"
        -If the Patient’s answer in (Q12) is yes, add 1.0 to intercept for "Post-stroke depression"
        -If the Patient’s answer in (Q13) is yes, add 0.5 to intercept for "Anxiety disorder", "Obstructive sleep apnea"
        -If the Patient’s answer in (Q14) is yes, add 1.0 to intercept for "Post-stroke depression"
        -If the Patient’s answer in (Q15) is yes, add 1.0 to intercept for "Heart disease such as angina"
        -If the Patient’s answer in (Q16) is yes, add 1.0 to intercept for "Deep vein thrombosis"
        -If the Patient’s answer in (Q17) is yes, add 0.5 to intercept for "Aspiration pneumonia"
        -If the Patient’s answer in (Q18) is yes, add 0.5 to intercept for "Obstructive sleep apnea"
        -If the Patient’s answer in (Q19) is yes, add 0.5 to intercept for "Obstructive sleep apnea"
        -If the Patient’s answer in (Q20) is yes, add 0.3 to intercept for "Obstructive sleep apnea"
        -If the Patient’s answer in (Q21) is yes, add 0.5 to intercept for "Obstructive sleep apnea", "Insomnia"
        -If the Patient’s answer in (Q22) is yes, add 1.0 to intercept for "Insomnia"
        -If the Patient’s answer in (Q23) is yes, add 1.0 to intercept for "Falls"
        -If the Patient’s answer in (Q24) is yes, add 1.0 to intercept for "Visual field defect due to stroke"

        <Weight>
        -Default value of weight for each possible complication is 1.
        - If the Patient’s answer in (Q2) is yes, replace the weight for "Delirium" with 1.1.
        - If the Patient’s answer in (Q3) is yes, replace the weight for "Spasticity" with 1.1.
        - If the Patient’s answer in (Q6) is yes, replace the weight for "Adhesive capsulitis" with 1.1.
        - If the Patient’s answer in (Q7) is yes, replace the weight for "Complex regional pain syndrome" with 1.1.
        - If the Patient’s answer in (Q11) is yes, replace the weight for "Urinary or bowel dysfunction due to stroke" with 1.1.
        - If the Patient’s answer in (Q15) is yes, replace the weight for "Heart disease such as angina" with 1.1.
        - If the Patient’s answer in (Q16) is yes, replace the weight for "Deep vein thrombosis" with 1.1.
    """

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        ("human", "{context}"),
    ])

    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain

def create_simple_rag_chain_Parkinsons_Disease(vectorstore, api_key):
    chat = ChatUpstage(upstage_api_key=api_key, temperature=0)

    retriever = vectorstore.as_retriever(k=2)

    qa_system_prompt = """You are a renowned rehabilitation medicine specialist. Check the patient's condition and suggest suspected diagnoses.

    1. Check the patient's condition in <Conversation>.

    2. Execute the following steps. Print the results if the step requires you to do so:
        -Step 1: Possible complications are "Levodopa-related motor complications", "Dopamine agonist withdrawal syndrome", "Dyskinesia", "Parkinsonism-hyperpyrexia syndrome", "Orthostatic hypotension","Primary constipation", "Serotonin syndrome", "Psychosis", "Delirium", "Intestinal pseudo-obstruction","Impulse-control disorders","Dopamine-dysregulation syndrome", "Adverse drug reaction","Dopamine agonist withdrawal syndrome","Postoperative depression", "Anemia or cardiac disorders", "Neurogenic dysphagia","Excessive daytime sleepiness","Sudden-onset-sleep","REM-sleep behavior disorder","Falls", "Fracture","Bezoar".
        For each possible complication, count sentences in the uploaded PDF files that supports that the Patient in <Conversation> has that complication.
        -Step 2: For each possible complication, calculate ‘certainty score’ by multiplying sentence count from Step 1 with ‘weight according to <Weight>’ and adding the multiplication result to ‘intercept according to <Intercept>’.
        -Step 3: Extract 3 possible complications with the highest ‘certainty score’s and print them in the form below. In “probability” slot, put “probable” if corresponding certainty score is greater than 1 and “less likely” if lesser or equal to 1.

        [Complications list]
        Rank 1- “Possible complication” “certainty score” “probability”
        Rank 2- “Possible complication” “certainty score” “probability”
        Rank 3- “Possible complication” “certainty score” “probability”

        -Step 4: Print further evaluations from the uploaded PDF files that corresponds to 3 possible complications extracted in Step 3.
        -Step 5: Print treatments from the PDF files that corresponds to 3 possible complications extracted in Step 3. Outline the treatment process in chronological order, such as by week, month, or year.

        <Intercept>   
        -Default value of intercept for each possible complication is 0.    
        -If the Patient’s answer in (Q2) is yes, add 0.3 to intercept for "Levodopa-related motor complications"
        -If the Patient’s answer in (Q2) is yes and (Q3) is yes, add 0.5 to intercept for "Levodopa-related motor complications"
        -If the Patient’s answer in (Q2) is yes and (Q4) is yes, add 0.5 to intercept for "Levodopa-related motor complications"
        -If the Patient’s answer in (Q4) is yes and (Q26) is yes, add 0.5 to intercept for "Dopamine agonist withdrawal syndrome"
        -If the Patient’s answer in (Q2) is yes and (Q5) is yes, add 1.0 to intercept for "Dyskinesia"
        -If the Patient’s answer in (Q42) is yes and (Q5) is yes, add 1.0 to intercept for "Dyskinesia"
        -If the Patient’s answer in (Q6) is yes, add 1.0 to intercept for "Parkinsonism-hyperpyrexia syndrome", "Orthostatic hypotension"
        -If the Patient’s answer in (Q7) is yes, add 0.3 to intercept for "Parkinsonism-hyperpyrexia syndrome"
        -If the Patient’s answer in (Q8) is yes, add 1.0 to intercept for "Primary constipation"
        -If the Patient’s answer in (Q6) is yes and (Q8) is yes, add 0.5 to intercept for "Parkinsonism-hyperpyrexia syndrome"
        -If the Patient’s answer in (Q6) is yes and (Q9) is yes, add 0.5 to intercept for "Parkinsonism-hyperpyrexia syndrome"
        -If the Patient’s answer in (Q6) is yes and (Q10) is yes, add 0.3 to intercept for "Parkinsonism-hyperpyrexia 
        syndrome"
        -If the Patient’s answer in (Q5) is yes and (Q10) is yes, add 0.3 to intercept for "Dyskinesia-hyperpyrexia syndrome"
        -If the Patient’s answer in (Q11) is yes, add 0.5 to intercept for "Parkinsonism-hyperpyrexia syndrome"
        -If the Patient’s answer in (Q12) is yes, add 0.5 to intercept for "Parkinsonism-hyperpyrexia syndrome", "Dyskinesia-hyperpyrexia syndrome", "Serotonin syndrome"
        -If the Patient’s answer in (Q13) is yes, add 0.5 to intercept for "Dyskinesia-hyperpyrexia syndrome"
        -If the Patient’s answer in (Q14) is yes, add 0.3 to intercept for "Serotonin syndrome"
        -If the Patient’s answer in (Q15) is yes, add 0.5 to intercept for "Serotonin syndrome"
        -If the Patient’s answer in (Q16) is yes, add 0.3 to intercept for "Serotonin syndrome", "Psychosis"
        -If the Patient’s answer in (Q17) is yes, add 0.5 to intercept for "Serotonin syndrome"
        -If the Patient’s answer in (Q18) is yes, add 1.0 to intercept for "Psychosis"
        -If the Patient’s answer in (Q19) is yes, add 1.0 to intercept for "Delirium"
        -If the Patient’s answer in (Q20) is yes, add 0.5 to intercept for "Delirium", "Intestinal pseudo-obstruction"
        -If the Patient’s answer in (Q21) is yes, add 0.3 to intercept for "Psychosis"
        -If the Patient’s answer in (Q22) is yes, add 0.3 to intercept for "Psychosis"
        -If the Patient’s answer in (Q23) is yes, add 0.3 to intercept for "Psychosis"
        -If the Patient’s answer in (Q24) is yes, add 0.5 to intercept for "Impulse-control disorders","Dopamine-dysregulation syndrome"
        -If the Patient’s answer in (Q24) is yes and (Q46) is yes, add 0.5 to intercept for "Adverse drug reaction"
        -If the Patient’s answer in (Q25) is yes, add 0.3 to intercept for "Impulse-control disorders"
        -If the Patient’s answer in (Q26) is yes, add 0.3 to intercept for "Dopamine agonist withdrawal syndrome"
        -If the Patient’s answer in (Q27) is yes, add 0.5 to intercept for "Dopamine-dysregulation syndrome"
        -If the Patient’s answer in (Q28) is yes, add 0.5 to intercept for "Dopamine-dysregulation syndrome"
        -If the Patient’s answer in (Q28) is yes and (Q42) is yes, add 0.5 to intercept for "Postoperative depression"
        -If the Patient’s answer in (Q29) is yes, add 0.5 to intercept for "Orthostatic hypotension"
        -If the Patient’s answer in (Q30) is yes, add 0.3 to intercept for "Orthostatic hypotension"
        -If the Patient’s answer in (Q31) is yes, add 0.3 to intercept for "Orthostatic hypotension"
        -If the Patient’s answer in (Q32) is yes, add 0.5 to intercept for "Orthostatic hypotension", "Anemia or cardiac disorders"
        -If the Patient’s answer in (Q33) is yes, add 1.0 to intercept for "Neurogenic dysphagia"
        -If the Patient’s answer in (Q34) is yes, add 0.3 to intercept for "Neurogenic dysphagia"
        -If the Patient’s answer in (Q35) is yes, add 0.3 to intercept for "Intestinal pseudo-obstruction"
        -If the Patient’s answer in (Q36) is yes, add 0.5 to intercept for "Intestinal pseudo-obstruction"
        -If the Patient’s answer in (Q37) is yes, add 1.0 to intercept for "Excessive daytime sleepiness"
        -If the Patient’s answer in (Q38) is yes, add 1.0 to intercept for "Sudden-onset-sleep"
        -If the Patient’s answer in (Q39) is yes, add 0.5 to intercept for "REM-sleep behavior disorder"
        -If the Patient’s answer in (Q40) is yes, add 0.5 to intercept for "REM-sleep behavior disorder"
        -If the Patient’s answer in (Q41) is yes, add 1.0 to intercept for "Falls", "Fracture"
        -If the Patient’s answer in (Q44) is yes, add 1.0 to intercept for "Bezoar"
        -If the Patient’s answer in (Q46) is yes, add 0.5 to intercept for "Intestinal pseudo-obstruction"
        -If the Patient’s answer in (Q46) is yes and (Q45) is yes, add 0.5 to intercept for "Adverse drug reaction"

        <Weight>
        -Default value of weight for each possible complication is 1.
        - If the Patient’s answer in (Q11) is yes, replace the weight for "Parkinsonism-hyperpyrexia syndrome" with 1.1.
        - If the Patient’s answer in (Q13) is yes, replace the weight for "Dyskinesia-hyperpyrexia syndrome" with 1.1.
        - If the Patient’s answer in (Q17) is yes, replace the weight for "Serotonin syndrome" with 1.1.
        - If the Patient’s answer in (Q19) is yes, replace the weight for "Delirium" with 1.1.
        - If the Patient’s answer in (Q28) is yes, replace the weight for "Dopamine-dysregulation syndrome" with 1.1.
        - If the Patient’s answer in (Q29) is yes, replace the weight for "Orthostatic hypotension" with 1.1.
    """

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        ("human", "{context}"),
    ])

    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain

def create_simple_rag_chain_Spinal_Cord_Injury(vectorstore, api_key):
    chat = ChatUpstage(upstage_api_key=api_key, temperature=0)

    retriever = vectorstore.as_retriever(k=2)

    qa_system_prompt = """You are a renowned rehabilitation medicine specialist. Check the patient's condition and suggest suspected diagnoses.

    1. Check the patient's condition in <Conversation>.

    2. Execute the following steps. Print the results if the step requires you to do so:
        -Step 1: Possible complications are "Atelectasis", "Pneumonia", "Respiratory failure","Pleural effusion", "Pneumothorax", "Hemothorax","Obstructive sleep apnea","Orthostatic hypotension" , "Autonomic dysreflexia", "Neurogenic bowel", "Spasticity", "Nociceptive pain","Neuropathic pain","Pressure ulcers","Osteoporosis", "Fractures".
        For each possible complication, count sentences in the uploaded PDF files that supports that the Patient in <Conversation> has that complication.
        -Step 2: For each possible complication, calculate ‘certainty score’ by multiplying sentence count from Step 1 with ‘weight according to <Weight>’ and adding the multiplication result to ‘intercept according to <Intercept>’.
        -Step 3: Extract 3 possible complications with the highest ‘certainty score’s and print them in the form below. In “probability” slot, put “probable” if corresponding certainty score is greater than 1 and “less likely” if lesser or equal to 1.

        [Complications list]
        Rank 1- “Possible complication” “certainty score” “probability”
        Rank 2- “Possible complication” “certainty score” “probability”
        Rank 3- “Possible complication” “certainty score” “probability”

        -Step 4: Print further evaluations from the uploaded PDF files that corresponds to 3 possible complications extracted in Step 3.
        -Step 5: Print treatments from the PDF files that corresponds to 3 possible complications extracted in Step 3. Outline the treatment process in chronological order, such as by week, month, or year.

        <Intercept>    
        -Default value of intercept for each possible complication is 0.     
        -If the Patient’s answer in (Q2) is yes, add 0.5 to intercept for "Atelectasis", "Pneumonia", "Respiratory failure" 
        -If the Patient’s answer in (Q3) is yes, add 0.5 to intercept for "Pleural effusion", "Pneumothorax", "Hemothorax" 
        -If the Patient’s answer in (Q4) is yes, add 1.0 to intercept for "Obstructive sleep apnea" 
        -If the Patient’s answer in (Q5) is yes, add 1.0 to intercept for "Orthostatic hypotension" 
        -If the Patient’s answer in (Q6) is yes, add 0.5 to intercept for "Orthostatic hypotension" , "Autonomic dysreflexia"
        -If the Patient’s answer in (Q7) is yes, add 1.0 to intercept for "Autonomic dysreflexia"
        -If the Patient’s answer in (Q8) is yes, add 0.5 to intercept for "Autonomic dysreflexia"
        -If the Patient’s answer in (Q9) is yes, add 1.0 to intercept for "Neurogenic bladder"
        -If the Patient’s answer in (Q10) is yes, add 0.5 to intercept for "Autonomic dysreflexia", "Neurogenic bowel"
        -If the Patient’s answer in (Q11) is yes, add 0.5 to intercept for "Neurogenic bowel"
        -If the Patient’s answer in (Q12) is yes, add 1.0 to intercept for "Spasticity"
        -If the Patient’s answer in (Q13) is yes, add 1.0 to intercept for "Nociceptive pain"
        -If the Patient’s answer in (Q14) is yes, add 1.0 to intercept for "Neuropathic pain"
        -If the Patient’s answer in (Q15) is yes, add 1.0 to intercept for "Pressure ulcers"
        -If the Patient’s answer in (Q16) is yes, add 0.3 to intercept for "Osteoporosis"
        -If the Patient’s answer in (Q17) is yes, add 0.5 to intercept for "Fractures"
        -If the Patient’s answer in (Q18) is yes, add 0.5 to intercept for "Fractures"

        <Weight>
        -Default value of weight for each possible complication is 1.
        - If the Patient’s answer in (Q4) is yes, replace the weight for "Obstructive sleep apnea" with 1.1.
        - If the Patient’s answer in (Q5) is yes, replace the weight for "Orthostatic hypotension" with 1.1.
        - If the Patient’s answer in (Q7) is yes, replace the weight for "Autonomic dysreflexia" with 1.1.
        - If the Patient’s answer in (Q9) is yes, replace the weight for "Neurogenic bladder" with 1.1.
        - If the Patient’s answer in (Q12) is yes, replace the weight for "Spasticity" with 1.1.
        - If the Patient’s answer in (Q15) is yes, replace the weight for "Pressure ulcers" with 1.1.
    """

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        ("human", "{context}"),
    ])

    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain

def create_simple_rag_chain_ALS(vectorstore, api_key):
    chat = ChatUpstage(upstage_api_key=api_key, temperature=0)

    retriever = vectorstore.as_retriever(k=2)

    qa_system_prompt = """You are a renowned rehabilitation medicine specialist. Check the patient's condition and suggest suspected diagnoses.

    1. Check the patient's condition in <Conversation>.

    2. Execute the following steps. Print the results if the step requires you to do so:
        -Step 1: Possible complications are "Sialorrhea", "Respiratory infection", "Emotional lability", "Spasticity", "Cramp", "Dysphagia", "Hypoventilation", "Depression", "Fatigue", "Cognitive impairment", "Sleep disturbance", "Musculoskeletal Pain"", "Urinary incontinence", "Hypertension".
        For each possible complication, count sentences in the uploaded PDF files that supports that the Patient in <Conversation> has that complication.
        -Step 2: For each possible complication, calculate ‘certainty score’ by multiplying sentence count from Step 1 with ‘weight according to <Weight>’ and adding the multiplication result to ‘intercept according to <Intercept>’.
        -Step 3: Extract 3 possible complications with the highest ‘certainty score’s and print them in the form below. In “probability” slot, put “probable” if corresponding certainty score is greater than 1 and “less likely” if lesser or equal to 1.

        [Complications list]
        Rank 1- “Possible complication” “certainty score” “probability”
        Rank 2- “Possible complication” “certainty score” “probability”
        Rank 3- “Possible complication” “certainty score” “probability”

        -Step 4: Print further evaluations from the uploaded PDF files that corresponds to 3 possible complications extracted in Step 3.
        -Step 5: Print treatments from the PDF files that corresponds to 3 possible complications extracted in Step 3. Outline the treatment process in chronological order, such as by week, month, or year.

        <Intercept>    
        -Default value of intercept for each possible complication is 0.     
        -If the Patient’s answer in (Q1) is yes, add 1.0 to intercept for "Sialorrhea"
        -If the Patient’s answer in (Q2) is yes, add 0.5 to intercept for  "Respiratory infection"
        -If the Patient’s answer in (Q3) is yes, add 1.0 to intercept for "Emotional lability"
        -If the Patient’s answer in (Q4) is yes, add 1.0 to intercept for "Spasticity"
        -If the Patient’s answer in (Q5) is yes, add 1.0 to intercept for "Cramp"
        -If the Patient’s answer in (Q6) is yes, add 1.0 to intercept for "Dysphagia"
        -If the Patient’s answer in (Q7) is yes, add 1.0 to intercept for "Hypoventilation"
        -If the Patient’s answer in (Q8) is yes, add 0.5 to intercept for "Hypoventilation"
        -If the Patient’s answer in (Q9) is yes, add 1.0 to intercept for "Depression"
        -If the Patient’s answer in (Q10) is yes, add 1.0 to intercept for "Fatigue"
        -If the Patient’s answer in (Q11) is yes, add 1.0 to intercept for  "Cognitive impairment"
        -If the Patient’s answer in (Q12) is yes, add 1.0 to intercept for  "Sleep disturbance"
        -If the Patient’s answer in (Q13) is yes, add 1.0 to intercept for  "Musculoskeletal Pain"
        -If the Patient’s answer in (Q14) is greater than 60, add 0.3 to intercept for  "Urinary incontinence"
        -If the Patient’s answer in (Q15) is yes, add 1.0 to intercept for  "Urinary incontinence"
        -If the Patient’s answer in (Q16) is yes, add 1.0 to intercept for  "Hypertension"

        <Weight>
        -Default value of weight for each possible complication is 1.
        - If the Patient’s answer in (Q4) is yes, replace the weight for "Spasticity" with 1.1.
        - If the Patient’s answer in (Q7) is yes, replace the weight for "Hypoventilation" with 1.1.
        - If the Patient’s answer in (Q15) is yes, replace the weight for "Urinary Incontinence" with 1.1.
    """

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        ("human", "{context}"),
    ])

    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain

def create_simple_rag_chain_Peripheral_Neuropathy(vectorstore, api_key):
    chat = ChatUpstage(upstage_api_key=api_key, temperature=0)

    retriever = vectorstore.as_retriever(k=2)

    qa_system_prompt = """You are a renowned rehabilitation medicine specialist. Check the patient's condition and suggest suspected diagnoses.

    1. Check the patient's condition in <Conversation>.

    2. Execute the following steps. Print the results if the step requires you to do so:
        -Step 1: Possible complications are "Foot ulcer", "Charcot foot", "Neuropathic pain".
        For each possible complication, count sentences in the uploaded PDF files that supports that the Patient in <Conversation> has that complication.
        -Step 2: For each possible complication, calculate ‘certainty score’ by multiplying sentence count from Step 1 with ‘weight according to <Weight>’ and adding the multiplication result to ‘intercept according to <Intercept>’.
        -Step 3: Extract 3 possible complications with the highest ‘certainty score’s and print them in the form below. In “probability” slot, put “probable” if corresponding certainty score is greater than 1 and “less likely” if lesser or equal to 1.

        [Complications list]
        Rank 1- “Possible complication” “certainty score” “probability”
        Rank 2- “Possible complication” “certainty score” “probability”
        Rank 3- “Possible complication” “certainty score” “probability”

        -Step 4: Print further evaluations from the uploaded PDF files that corresponds to 3 possible complications extracted in Step 3.
        -Step 5: Print treatments from the PDF files that corresponds to 3 possible complications extracted in Step 3. Outline the treatment process in chronological order, such as by week, month, or year.

        <Intercept>    
        -Default value of intercept for each possible complication is 0. 
        -If the Patient’s answer in (Q2) is no, add 1.0 to intercept for "Foot ulcer"
        -If the Patient’s answer in (Q3) is no, add 1.0 to intercept for "Foot ulcer"
        -If the Patient’s answer in (Q4) is yes, add 0.3 to intercept for "Foot ulcer"
        -If the Patient’s answer in (Q5) is yes, add 1.0 to intercept for "Charcot foot"
        -If the Patient’s answer in (Q6) is yes, add 1.0 to intercept for "Neuropathic pain"
        -If the Patient’s answer in (Q7) is yes, add 1.0 to intercept for "Neuropathic pain"

        <Weight>
        -Default value of weight for each possible complication is 1.
        - If the Patient’s answer in (Q5) is no, replace the weight for "Charcot foot" with 1.1.

    """

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        ("human", "{context}"),
    ])

    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain

# Create history questions for 4 chief complaints
def create_history_questions_Lower_Extremity(patient_info):
    return "\n".join([
        f"(Q1)\nDoctor: When did the symptom start?\nPatient: {patient_info['Q1']}",
        f"(Q2)\nDoctor: Where does it hurt? Multiple choices are possible among buttock, hip joint, thigh, calf, knee joint. See Photo 1.\nPatient: {patient_info['Q2']}",
        f"(Q3)\nDoctor: Which side does it hurt? Possible choices are front, back, lateral, or medial.\nPatient: {patient_info['Q3']}",
        f"(Q4)\nDoctor: Specify the direction of the painful site. Possible choices are right, left, or both.\nPatient: {patient_info['Q4']}",
        f"(Q5)\nDoctor: If the pain radiate to different areas, tell me the areas. Examples are low back, perineum, buttock, head and neck.\nPatient: {patient_info['Q5']}",
        f"(Q6)\nDoctor: Do you ever have times when the joint doesn't move properly (catching) or feel rigid?\nPatient: {patient_info['Q6']}",
        f"(Q7)\nDoctor: Does the joint make clicking or rubbing sounds accompanied by pain?\nPatient: {patient_info['Q7']}",
        f"(Q8)\nDoctor: Does the joint make clicking sounds without pain?\nPatient: {patient_info['Q8']}",
        f"(Q9)\nDoctor: Is there heat sense at the painful site?\nPatient: {patient_info['Q9']}",
        f"(Q10)\nDoctor: Is there bruising at the painful site?\nPatient: {patient_info['Q10']}",
        f"(Q11)\nDoctor: Is there swelling at the painful site (localized swelling)?\nPatient: {patient_info['Q11']}",
        f"(Q12)\nDoctor: Is there altered sensation in buttock, thigh, or foot?\nPatient: {patient_info['Q12']}",
        f"(Q13)\nDoctor: Have you recently experienced trauma such as car accidents or falls?\nPatient: {patient_info['Q13']}",
        f"(Q14)\nDoctor: Have you recently played soccer or done exercises like splits or gymnastics?\nPatient: {patient_info['Q14']}",
        f"(Q15)\nDoctor: If you are an athlete, specify the sport you are playing.\nPatient: {patient_info['Q15']}",
        f"(Q16)\nDoctor: Have you traveled abroad recently?\nPatient: {patient_info['Q16']}",
        f"(Q17)\nDoctor: Does the pain worsen during walking or running?\nPatient: {patient_info['Q17']}",
        f"(Q18)\nDoctor: Does the pain worsen during sitting?\nPatient: {patient_info['Q18']}",
        f"(Q19)\nDoctor: Does the pain worsen during weight-bearing exercises?\nPatient: {patient_info['Q19']}",
        f"(Q20)\nDoctor: Does the pain worsen after exercise?\nPatient: {patient_info['Q20']}",
        f"(Q21)\nDoctor: Does the pain worsen when bending your knee for an extended period?\nPatient: {patient_info['Q21']}",
        f"(Q22)\nDoctor: Does the pain alleviate when lying down?\nPatient: {patient_info['Q22']}",
        f"(Q23)\nDoctor: How old are you?\nPatient: {patient_info['Q23']}",
        f"(Q24)\nDoctor: What is your gender? Choices are female or male.\nPatient: {patient_info['Q24']}",
        f"(Q25)\nDoctor: Does pain occur when walking up stairs or sitting for an extended period?\nPatient: {patient_info['Q25']}",
        f"(Q26)\nDoctor: Have you ever been diagnosed with osteoporosis?\nPatient: {patient_info['Q26']}",
        f"(Q27)\nDoctor: Have you ever been diagnosed with at least one of the following - cancer, stroke, deep vein thrombosis, heart failure, pregnancy, varicose veins, nephrotic syndrome, rheumatological disease, acute inflammatory bowel disease?\nPatient: {patient_info['Q27']}",
        f"(Q28)\nDoctor: Have you recently had any hormonal treatments, chemotherapy, taken birth control pills, experienced prolonged immobility, or been on a long flight?\nPatient: {patient_info['Q28']}",
        f"(Q29)\nDoctor: Is your FABER test result positive? See Video 1 for instructions.\nPatient: {patient_info['Q29']}",
        f"(Q30)\nDoctor: Is there tenderness at the sore spot?\nPatient: {patient_info['Q30']}",
        f"(Q31)\nDoctor: Is your Pace maneuver result positive? See Video 2 for instructions.\nPatient: {patient_info['Q31']}",
        f"(Q32)\nDoctor: Is your Lachman test result positive? See Video 3 for instructions.\nPatient: {patient_info['Q32']}",
        f"(Q33)\nDoctor: Is your Reverse Lachman test result positive? See Video 4 for instructions.\nPatient: {patient_info['Q33']}",
        f"(Q34)\nDoctor: Is your Valgus stress test result positive? See Video 5 for instructions.\nPatient: {patient_info['Q34']}",
        f"(Q35)\nDoctor: Is your McMurray test result positive? See Video 6 for instructions.\nPatient: {patient_info['Q35']}",
        f"(Q36)\nDoctor: Is there tenderness at the front side of the knee?\nPatient: {patient_info['Q36']}",
        f"(Q37)\nDoctor: Are you unable to bend knees to 90 degrees?\nPatient: {patient_info['Q37']}",
        f"(Q38)\nDoctor: Are you unable to bear weight for 4 steps while walking?\nPatient: {patient_info['Q38']}",
        f"(Q39)\nDoctor: Is there a discoloration on your skin?\nPatient: {patient_info['Q39']}",
        f"(Q40)\nDoctor: Is there a weakness in leg muscles?\nPatient: {patient_info['Q40']}",
        f"(Q41)\nDoctor: Are you walking with a limp?\nPatient: {patient_info['Q41']}",
        f"(Q42)\nDoctor: Have you had surgery around the hip joint, taken steroids, or received intra-articular injections?\nPatient: {patient_info['Q42']}"
    ])

def create_history_questions_Upper_Extremity(patient_info):
    return "\n".join([
        f"(Q1)\nDoctor: When did the symptom start?\nPatient: {patient_info['Q1']}",
        f"(Q2)\nDoctor: Where does it hurt? Multiple choices possible among shoulder girdle, shoulder joint, upper arm, elbow, forearm, wrist, fingers.\nPatient: {patient_info['Q2']}",
        f"(Q3)\nDoctor: Which side does it hurt? Possible choices are front, back, lateral, medial, dorsal, ventral.\nPatient: {patient_info['Q3']}",
        f"(Q4)\nDoctor: Specify the direction of the painful site. Possible choices are right, left, or both.\nPatient: {patient_info['Q4']}",
        f"(Q5)\nDoctor: If the pain radiates to different areas, tell me the areas. Examples are upper arm and forearm.\nPatient: {patient_info['Q5']}",
        f"(Q6)\nDoctor: Was the onset of pain gradual or abrupt?\nPatient: {patient_info['Q6']}",
        f"(Q7)\nDoctor: Did you have fever or night sweating?\nPatient: {patient_info['Q7']}",
        f"(Q8)\nDoctor: Did you lose weight recently?\nPatient: {patient_info['Q8']}",
        f"(Q9)\nDoctor: Are there new respiratory symptoms such as breathing difficulties, cough, or sputum?\nPatient: {patient_info['Q9']}",
        f"(Q10)\nDoctor: Is there weakness in arm?\nPatient: {patient_info['Q10']}",
        f"(Q11)\nDoctor: Is the grasping strength weaker than before?\nPatient: {patient_info['Q11']}",
        f"(Q12)\nDoctor: Is there weakness in extension of the elbow compared with the healthy side?\nPatient: {patient_info['Q12']}",
        f"(Q13)\nDoctor: Is there clicking sound during elbow flexion or extension?\nPatient: {patient_info['Q13']}",
        f"(Q14)\nDoctor: Is there friction sound around pisiform bone when bending your wrist? See Photo 1.\nPatient: {patient_info['Q14']}",
        f"(Q15)\nDoctor: Is there friction sound during wrist flexion or extension?\nPatient: {patient_info['Q15']}",
        f"(Q16)\nDoctor: Is there a decrease in range of motion at the wrist (does your wrist move less than it used to)?\nPatient: {patient_info['Q16']}",
        f"(Q17)\nDoctor: Have you ever experienced a catching or locking sensation in your wrist?\nPatient: {patient_info['Q17']}",
        f"(Q18)\nDoctor: Is it difficult to extend your proximal interphalangeal joint of the finger? See Photo 2.\nPatient: {patient_info['Q18']}",
        f"(Q19)\nDoctor: Is it difficult to extend the distal interphalangeal joint of the finger? See Photo 2.\nPatient: {patient_info['Q19']}",
        f"(Q20)\nDoctor: Is it difficult to bend (flex) the distal interphalangeal joint of the finger?\nPatient: {patient_info['Q20']}",
        f"(Q21)\nDoctor: Is there a triggering phenomenon when bending your fingers? See Video 1.\nPatient: {patient_info['Q21']}",
        f"(Q22)\nDoctor: Is there a rapidly increasing mass at the elbow?\nPatient: {patient_info['Q22']}",
        f"(Q23)\nDoctor: Does the pain aggravate during sleep?\nPatient: {patient_info['Q23']}",
        f"(Q24)\nDoctor: Does the pain aggravate when sleeping toward the aching side?\nPatient: {patient_info['Q24']}",
        f"(Q25)\nDoctor: Does the pain occur only during specific posture. Examples are during throwing a ball or serving a tennis ball.\nPatient: {patient_info['Q25']}",
        f"(Q26)\nDoctor: Have you lifted heavy objects recently?\nPatient: {patient_info['Q26']}",
        f"(Q27)\nDoctor: Does the pain worsen when performing horizontal adduction of the shoulder? See Video 2.\nPatient: {patient_info['Q27']}",
        f"(Q28)\nDoctor: Have you recently experienced trauma at the painful site?\nPatient: {patient_info['Q28']}",
        f"(Q29)\nDoctor: Does the pain worsen when grasping firmly?\nPatient: {patient_info['Q29']}",
        f"(Q30)\nDoctor: Does the pain worsen during wrist flexion or forearm pronation? See Photo 3.\nPatient: {patient_info['Q30']}",
        f"(Q31)\nDoctor: Does the pain occur at the cubital fossa when bending the elbow or throwing an object? See Photo 4.\nPatient: {patient_info['Q31']}",
        f"(Q32)\nDoctor: Does the pain occur at the cubital fossa when lifting heavy objects? See Photo 4.\nPatient: {patient_info['Q32']}",
        f"(Q33)\nDoctor: Does the pain worsen during extension of your elbow?\nPatient: {patient_info['Q33']}",
        f"(Q34)\nDoctor: Have you recently played racket sports or golf more frequently than usual?\nPatient: {patient_info['Q34']}",
        f"(Q35)\nDoctor: Does the pain worsen after playing racket sports, golf or fishing?\nPatient: {patient_info['Q35']}",
        f"(Q36)\nDoctor: Have you recently done activities involving your thumb, such as using scissors?\nPatient: {patient_info['Q36']}",
        f"(Q37)\nDoctor: Have you ever received steroid injections in your elbow or taken oral steroids?\nPatient: {patient_info['Q37']}",
        f"(Q38)\nDoctor: Did the pain occur after grasping something firmly?\nPatient: {patient_info['Q38']}",
        f"(Q39)\nDoctor: Have you ever been diagnosed with breast or lung cancer?\nPatient: {patient_info['Q39']}",
        f"(Q40)\nDoctor: Did swelling of the elbow occur following trauma?\nPatient: {patient_info['Q40']}",
        f"(Q41)\nDoctor: Did the wrist or finger pain worsen 1-2 days after an injury?\nPatient: {patient_info['Q41']}",
        f"(Q42)\nDoctor: Was there a persistent pain despite ice, rest, immobilization, pain medications after a few days?\nPatient: {patient_info['Q42']}",
        f"(Q43)\nDoctor: Is there a subacromial sulcus at the lateral side of the shoulder? See Photo 5.\nPatient: {patient_info['Q43']}",
        f"(Q44)\nDoctor: Is passive ROM of shoulder generally greater than active ROM of shoulder? See Video 3 and 4.\nPatient: {patient_info['Q44']}",
        f"(Q45)\nDoctor: Is ROM decreased in all 4 directions compared with healthy side? See Video 3 and 4.\nPatient: {patient_info['Q45']}",
        f"(Q46)\nDoctor: Are active and passive ROM both decreased compared with healthy side? See Video 3 and 4.\nPatient: {patient_info['Q46']}",
        f"(Q47)\nDoctor: Is ROM decreased in only specific direction compared with healthy side? See Video 3 and 4.\nPatient: {patient_info['Q47']}",
        f"(Q48)\nDoctor: Is there tenderness at the acro-clavicular joint or around rotator cuff? See Video 5.\nPatient: {patient_info['Q48']}",
        f"(Q49)\nDoctor: Is there tenderness at the neck?\nPatient: {patient_info['Q49']}",
        f"(Q50)\nDoctor: Is there localized mass or swelling at the shoulder?\nPatient: {patient_info['Q50']}",
        f"(Q51)\nDoctor: Is there localized redness and heat sense at the shoulder?\nPatient: {patient_info['Q51']}",
        f"(Q52)\nDoctor: Is there tenderness at the lateral epicondyle of the elbow? See Photo 6.\nPatient: {patient_info['Q52']}",
        f"(Q53)\nDoctor: Is there tenderness at the medial epicondyle of the elbow?\nPatient: {patient_info['Q53']}",
        f"(Q54)\nDoctor: Are there bruising, swelling, or redness at the cubital fossa?\nPatient: {patient_info['Q54']}",
        f"(Q55)\nDoctor: Can you observe a deformed shape which is known as Popeye’s belly around biceps when bending your elbow? See Photo 7.\nPatient: {patient_info['Q55']}",
        f"(Q56)\nDoctor: Is there tenderness around the triceps tendon?\nPatient: {patient_info['Q56']}",
        f"(Q57)\nDoctor: Is there redness, bruising or swelling at the triceps tendon insertion site?\nPatient: {patient_info['Q57']}",
        f"(Q58)\nDoctor: Is there redness, heat sense or swelling at the olecranon? See photo 8.\nPatient: {patient_info['Q58']}",
        f"(Q59)\nDoctor: Is the elbow both tender and swollen?\nPatient: {patient_info['Q59']}",
        f"(Q60)\nDoctor: Is there localized swelling or tenderness at the ulnar side or back of the wrist?\nPatient: {patient_info['Q60']}",
        f"(Q61)\nDoctor: Is there tenderness at the radial side of the wrist?\nPatient: {patient_info['Q61']}",
        f"(Q62)\nDoctor: Is the result of Finkelstein test positive? See Video 6.\nPatient: {patient_info['Q62']}",
        f"(Q63)\nDoctor: Is there tenderness around extensor carpi ulnaris tendon? See Photo 9.\nPatient: {patient_info['Q63']}",
        f"(Q64)\nDoctor: Is there tenderness at the dorsal side of the wrist?\nPatient: {patient_info['Q64']}",
        f"(Q65)\nDoctor: Is there swelling or bruising at the anatomical snuffbox? See Photo 10.\nPatient: {patient_info['Q65']}",
        f"(Q66)\nDoctor: Is there tenderness, localized swelling or bruising at the distal radial side of the forearm?\nPatient: {patient_info['Q66']}",
        f"(Q67)\nDoctor: Is there tenderness at the lunate? See Photo 11.\nPatient: {patient_info['Q67']}",
        f"(Q68)\nDoctor: Do you experience tenderness when palpating the hollow area at the back of your wrist (distal to the radial styloid process, between the flexor carpi ulnaris tendon and the extensor carpi ulnaris tendon)?\nPatient: {patient_info['Q68']}",
        f"(Q69)\nDoctor: Is there tenderness at the back (dorsal side) of the finger?\nPatient: {patient_info['Q69']}",
        f"(Q70)\nDoctor: Is it impossible to extend proximal interphalangeal joint of the finger actively but possible to extend passively?\nPatient: {patient_info['Q70']}",
        f"(Q71)\nDoctor: Is there redness, bruising, or swelling at the back (dorsal side) of the distal interphalangeal joint of the finger?\nPatient: {patient_info['Q71']}",
        f"(Q72)\nDoctor: Is there tenderness at the ulnar collateral ligament of the thumb? See Photo 12.\nPatient: {patient_info['Q72']}",
        f"(Q73)\nDoctor: Is there tenderness at the ulnar or radial side in any of the interphalangeal joints of the fingers?\nPatient: {patient_info['Q73']}",
        f"(Q74)\nDoctor: Is there tenderness or nodule around A1 pulley of a finger? See Photo 13.\nPatient: {patient_info['Q74']}",
        f"(Q75)\nDoctor: Is Bakody’s sign positive?\nPatient: {patient_info['Q75']}",
        f"(Q76)\nDoctor: How old are you?\nPatient: {patient_info['Q76']}"
    ])

def create_history_questions_Low_Back_Pain(patient_info):
    return "\n".join([
        f"(Q1)\nDoctor: When did the symptom start?\nPatient: {patient_info['Q1']}",
        f"(Q2)\nDoctor: Did the pain start suddenly, or did it develop gradually?\nPatient: {patient_info['Q2']}",
        f"(Q3)\nDoctor: Where does it hurt? Multiple choices are possible among central, peripheral part of the back.\nPatient: {patient_info['Q3']}",
        f"(Q4)\nDoctor: Specify the direction of the painful site. Possible choices are right, left, or both.\nPatient: {patient_info['Q4']}",
        f"(Q5)\nDoctor: If the pain radiates to different areas, tell me the areas. Examples are thigh, calf, or foot.\nPatient: {patient_info['Q5']}",
        f"(Q6)\nDoctor: Is there pain in perineal area or buttock?\nPatient: {patient_info['Q6']}",
        f"(Q7)\nDoctor: Has the level of pain remained consistent since it first started, or has it fluctuated, with periods of improvement and worsening?\nPatient: {patient_info['Q7']}",
        f"(Q8)\nDoctor: Have you experienced the same type of pain before?\nPatient: {patient_info['Q8']}",
        f"(Q9)\nDoctor: How severe is the pain on a scale of 0 to 10?\nPatient: {patient_info['Q9']}",
        f"(Q10)\nDoctor: Did you unintentionally lose your weight recently?\nPatient: {patient_info['Q10']}",
        f"(Q11)\nDoctor: Have you had fever (possibly indicating infection) recently?\nPatient: {patient_info['Q11']}",
        f"(Q12)\nDoctor: Have you experienced any recent difficulties with bowel movements or urination?\nPatient: {patient_info['Q12']}",
        f"(Q13)\nDoctor: Is there persistent leg weakness or walking (gait) disturbance?\nPatient: {patient_info['Q13']}",
        f"(Q14)\nDoctor: Is there back stiffness in the morning?\nPatient: {patient_info['Q14']}",
        f"(Q15)\nDoctor: Is there pain in other joints?\nPatient: {patient_info['Q15']}",
        f"(Q16)\nDoctor: Have you noticed any changes in the skin color on your toes?\nPatient: {patient_info['Q16']}",
        f"(Q17)\nDoctor: Do you have a rash on your legs?\nPatient: {patient_info['Q17']}",
        f"(Q18)\nDoctor: Have you recently had issues like eye inflammation (iritis), skin rashes, diarrhea, or discharge from the urethra?\nPatient: {patient_info['Q18']}",
        f"(Q19)\nDoctor: Does back pain and radiating pain toward the legs worsen when bending over?\nPatient: {patient_info['Q19']}",
        f"(Q20)\nDoctor: Does the pain subside when lying down and aggravate when standing up?\nPatient: {patient_info['Q20']}",
        f"(Q21)\nDoctor: Does the pain remain consistent regardless of the posture such as sitting, lying down?\nPatient: {patient_info['Q21']}",
        f"(Q22)\nDoctor: Does the pain occur when you straighten your back after bending over, or when you cough or sneeze?\nPatient: {patient_info['Q22']}",
        f"(Q23)\nDoctor: Does the pain occur when you stand up for an extended period, or when you walk?\nPatient: {patient_info['Q23']}",
        f"(Q24)\nDoctor: How old are you?\nPatient: {patient_info['Q24']}",
        f"(Q25)\nDoctor: When walking for a long time, do you experience pain in both legs or in one hip, and does bending your back relieve the pain?\nPatient: {patient_info['Q25']}",
        f"(Q26)\nDoctor: Does the pain subside when doing exercise?\nPatient: {patient_info['Q26']}",
        f"(Q27)\nDoctor: Does the pain linger even after rest?\nPatient: {patient_info['Q27']}",
        f"(Q28)\nDoctor: Does the pain worsen during the night?\nPatient: {patient_info['Q28']}",
        f"(Q29)\nDoctor: Have you recently had any serious accidents such as traffic accidents, fall?\nPatient: {patient_info['Q29']}",
        f"(Q30)\nDoctor: Are you a cancer patient?\nPatient: {patient_info['Q30']}",
        f"(Q31)\nDoctor: Have you taken oral steroids recently?\nPatient: {patient_info['Q31']}",
        f"(Q32)\nDoctor: Have you recently had drug abuse?\nPatient: {patient_info['Q32']}",
        f"(Q33)\nDoctor: Are you infected to HIV or currently in a state of weakened immune function?\nPatient: {patient_info['Q33']}",
        f"(Q34)\nDoctor: Is there a noticeable difference in muscle size (atrophy) between both of your legs?\nPatient: {patient_info['Q34']}",
        f"(Q35)\nDoctor: Does the forward curve in your lower back (lumbar lordosis) stay the same whether you are sitting or standing? See Photo 1.\nPatient: {patient_info['Q35']}",
        f"(Q36)\nDoctor: Does the forward curve in your lower back (lumbar lordosis) disappear while you walk? See Photo 1.\nPatient: {patient_info['Q36']}",
        f"(Q37)\nDoctor: Is there any sign of sideways curvature of the spine (scoliosis)?\nPatient: {patient_info['Q37']}",
        f"(Q38)\nDoctor: When you walk, do your toes drag on the ground or do you lift your knees high to prevent them from dragging?\nPatient: {patient_info['Q38']}",
        f"(Q39)\nDoctor: Is Schober Test positive? See Video 1.\nPatient: {patient_info['Q39']}",
        f"(Q40)\nDoctor: During the Schober test, did the pain worsen when you bent forward?\nPatient: {patient_info['Q40']}",
        f"(Q41)\nDoctor: Did the pain worsen when you straightened your back during the Schober test?\nPatient: {patient_info['Q41']}",
        f"(Q42)\nDoctor: Are you able to raise both legs more than 60 degrees during Straight Leg Raise? See Video 2.\nPatient: {patient_info['Q42']}",
        f"(Q43)\nDoctor: (To guardians) Press on different areas of the lower back. Does the patient complain of widespread tenderness or tenderness even when pressing softly?\nPatient: {patient_info['Q43']}",
        f"(Q44)\nDoctor: What is your gender? Possible choices are male and female.\nPatient: {patient_info['Q44']}"
    ])

def create_history_questions_Neck_Pain(patient_info):
    return "\n".join([
        f"(Q1)\nDoctor: When did the symptom start?\nPatient: {patient_info['Q1']}",
        f"(Q2)\nDoctor: Did the pain start abruptly or gradually?\nPatient: {patient_info['Q2']}",
        f"(Q3)\nDoctor: Which side does it hurt? Possible choices are front, back, lateral or medial.\nPatient: {patient_info['Q3']}",
        f"(Q4)\nDoctor: Specify the direction of the painful site. Possible choices are right, left, or both.\nPatient: {patient_info['Q4']}",
        f"(Q5)\nDoctor: If the pain radiates to different areas, tell me the areas. Examples are shoulder girdle, upper arm, forearm, fingers, or head.\nPatient: {patient_info['Q5']}",
        f"(Q6)\nDoctor: Do you feel pain on only one side of your head, or in areas like the back of your head, around your ears, jawbone, or cheekbone?\nPatient: {patient_info['Q6']}",
        f"(Q7)\nDoctor: Is there persistent headache?\nPatient: {patient_info['Q7']}",
        f"(Q8)\nDoctor: Is the neck pain accompanied by severe arm pain?\nPatient: {patient_info['Q8']}",
        f"(Q9)\nDoctor: Is there weakness or muscle getting thinner (atrophy) in arms or legs?\nPatient: {patient_info['Q9']}",
        f"(Q10)\nDoctor: Is the weakness more severe in legs than in arms?\nPatient: {patient_info['Q10']}",
        f"(Q11)\nDoctor: Do you have numbness or abnormal sensations in your arms or legs?\nPatient: {patient_info['Q11']}",
        f"(Q12)\nDoctor: Have you recently experienced dizziness, vision problems, or ringing in your ears?\nPatient: {patient_info['Q12']}",
        f"(Q13)\nDoctor: How old are you?\nPatient: {patient_info['Q13']}",
        f"(Q14)\nDoctor: What is your gender?\nPatient: {patient_info['Q14']}",
        f"(Q15)\nDoctor: Does the pain worsen during coughing, sneezing, or doing Valsalva maneuver?\nPatient: {patient_info['Q15']}",
        f"(Q16)\nDoctor: Does the pain worsen when you tilt your head backward?\nPatient: {patient_info['Q16']}",
        f"(Q17)\nDoctor: Have you recently experienced trauma?\nPatient: {patient_info['Q17']}",
        f"(Q18)\nDoctor: Did you fall from a height of more than 5 stairs or over 90 meters?\nPatient: {patient_info['Q18']}",
        f"(Q19)\nDoctor: Did you injure your neck while diving?\nPatient: {patient_info['Q19']}",
        f"(Q20)\nDoctor: Were you rear-ended at a high speed (e.g. over 100 kilometers per hour), ejected from the vehicle during a car accident, or did the vehicle overturn?\nPatient: {patient_info['Q20']}",
        f"(Q21)\nDoctor: Were you in a motorcycle or bicycle accident?\nPatient: {patient_info['Q21']}",
        f"(Q22)\nDoctor: Are you a patient with osteoporosis?\nPatient: {patient_info['Q22']}",
        f"(Q23)\nDoctor: Have you ever received corticosteroid treatment?\nPatient: {patient_info['Q23']}",
        f"(Q24)\nDoctor: Are you a cancer patient?\nPatient: {patient_info['Q24']}",
        f"(Q25)\nDoctor: Have you experienced unintentional weight loss recently?\nPatient: {patient_info['Q25']}",
        f"(Q26)\nDoctor: Have you been receiving treatment for neck pain for over a month without any improvement?\nPatient: {patient_info['Q26']}",
        f"(Q27)\nDoctor: Have you had any difficulties in bowel movement or urination?\nPatient: {patient_info['Q27']}",
        f"(Q28)\nDoctor: Have you ever abused intravenous drugs?\nPatient: {patient_info['Q28']}",
        f"(Q29)\nDoctor: Have you previously had any neck surgeries?\nPatient: {patient_info['Q29']}",
        f"(Q30)\nDoctor: Does the pain improve when you raise the arm of the affected side above your head (Bakody’s sign)?\nPatient: {patient_info['Q30']}",
        f"(Q31)\nDoctor: Is Hoffman’s sign positive? See Video 1.\nPatient: {patient_info['Q31']}",
        f"(Q32)\nDoctor: Is Babinski’s sign positive? See Video 2.\nPatient: {patient_info['Q32']}",
        f"(Q33)\nDoctor: Is Spurling’s Test positive? See Video 3.\nPatient: {patient_info['Q33']}",
        f"(Q34)\nDoctor: Is L’hermitte’s sign positive? See Video 4.\nPatient: {patient_info['Q34']}",
        f"(Q35)\nDoctor: Is there localized tenderness in lateral side of the neck?\nPatient: {patient_info['Q35']}",
        f"(Q36)\nDoctor: Is there an increase in Knee Jerk Reflex? See Video 5.\nPatient: {patient_info['Q36']}",
        f"(Q37)\nDoctor: Do you have tenderness where the back of your head meets your neck?\nPatient: {patient_info['Q37']}",
        f"(Q38)\nDoctor: Has your neck’s range of motion decreased, or does it feel stiff when you move it?\nPatient: {patient_info['Q38']}"
    ])

# Create history questions for 6 Diagnoses
def create_history_questions_Traumatic_Brain_Injury(patient_info):
    return "\n".join([
        f"(Q1)\nDoctor: How long has it been since you were diagnosed with traumatic brain injury?\nPatient: {patient_info['Q1']}",
        f"(Q2)\nDoctor: Is there nausea, vomiting or drooping?\nPatient: {patient_info['Q2']}",
        f"(Q3)\nDoctor: Do you have persistent headache (In patients with communication difficulties, does the patient appear agitated or have any noticeable swelling)?\nPatient: {patient_info['Q3']}",
        f"(Q4)\nDoctor: Do you have a stabbing or sharp, knife-like headache, or does your head hurt even when lightly touched?\nPatient: {patient_info['Q4']}",
        f"(Q5)\nDoctor: Are there difficulties in walking (gait disturbance), memory loss (dementia) or difficulties in voiding (urinary incontinence)?\nPatient: {patient_info['Q5']}",
        f"(Q6)\nDoctor: Are there fatigue, cold intolerance, depression, missing periods (amenorrhea), or problems with thinking or memory?\nPatient: {patient_info['Q6']}",
        f"(Q7)\nDoctor: Have you recently experienced fever, high blood pressure, sweating, rapid breathing, a fast heartbeat, posture issues, or muscle stiffness?\nPatient: {patient_info['Q7']}",
        f"(Q8)\nDoctor: Do you have difficulties in breathing, sputum, or cough?\nPatient: {patient_info['Q8']}",
        f"(Q9)\nDoctor: Have you noticed a loss of smell, blind spots that appear differently in each eye, or any decrease in vision?\nPatient: {patient_info['Q9']}",
        f"(Q10)\nDoctor: Do your arms or legs feel stiff when you try to move them?\nPatient: {patient_info['Q10']}",
        f"(Q11)\nDoctor: Do you have any joints that are swollen, warm, painful, or have limited movement? Commonly affected joints include the hip, elbow, shoulder, and knee.\nPatient: {patient_info['Q11']}",
        f"(Q12)\nDoctor: Do you have insomnia, excessive sleep, or excessive daytime sleepiness?\nPatient: {patient_info['Q12']}",
        f"(Q13)\nDoctor: Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.\nPatient: {patient_info['Q13']}"
    ])

def create_history_questions_Stroke(patient_info):
    return "\n".join([
        f"(Q1)\nDoctor: How long has it been since you were diagnosed with stroke?\nPatient: {patient_info['Q1']}",
        f"(Q2)\nDoctor: Have you experienced new onset of decreased concentration, disorientation, memory loss, or language difficulties within a few days after the stroke, with these symptoms fluctuating between improvement and worsening?\nPatient: {patient_info['Q2']}",
        f"(Q3)\nDoctor: Have your arms or legs become stiffer than usual when you try to move them?\nPatient: {patient_info['Q3']}",
        f"(Q4)\nDoctor: Do you experience choking while swallowing food, a change in your voice after eating, difficulty swallowing, or a feeling of food stuck in your throat?\nPatient: {patient_info['Q4']}",
        f"(Q5)\nDoctor: Is there shoulder pain?\nPatient: {patient_info['Q5']}",
        f"(Q6)\nDoctor: Has your shoulder’s range of motion, especially when rotating outward or lifting it to the side, decreased?\nPatient: {patient_info['Q6']}",
        f"(Q7)\nDoctor: Have you recently noticed swelling, warmth, or ‘pain during movement’ in your wrist or hand?\nPatient: {patient_info['Q7']}",
        f"(Q8)\nDoctor: Have you developed pain in areas where you have numbness or tingling, such as your face or limbs?\nPatient: {patient_info['Q8']}",
        f"(Q9)\nDoctor: Do you have pain that gets worse with exercise and improves with rest?\nPatient: {patient_info['Q9']}",
        f"(Q10)\nDoctor: Do you feel pain triggered by movement, touch, or changes in temperature (allodynia)?\nPatient: {patient_info['Q10']}",
        f"(Q11)\nDoctor: Do you have constipation or difficulty holding your urine?\nPatient: {patient_info['Q11']}",
        f"(Q12)\nDoctor: Do you experience persistent feelings of depression?\nPatient: {patient_info['Q12']}",
        f"(Q13)\nDoctor: Do you frequently experience anxiety?\nPatient: {patient_info['Q13']}",
        f"(Q14)\nDoctor: Have you recently lost motivation in social activities or been participating less in rehabilitation programs than usual?\nPatient: {patient_info['Q14']}",
        f"(Q15)\nDoctor: Have you had abrupt chest pain recently?\nPatient: {patient_info['Q15']}",
        f"(Q16)\nDoctor: Have you been lying in bed for more than three days, or do you have swelling or tenderness in your legs?\nPatient: {patient_info['Q16']}",
        f"(Q17)\nDoctor: Have you been coughing frequently, noticed a change in the color of your phlegm, or experienced shortness of breath recently?\nPatient: {patient_info['Q17']}",
        f"(Q18)\nDoctor: Have you been waking up frequently during sleep or noticed that your snoring has become worse?\nPatient: {patient_info['Q18']}",
        f"(Q19)\nDoctor: Have you experienced headache recently?\nPatient: {patient_info['Q19']}",
        f"(Q20)\nDoctor: Are you overweight (BMI>25)?\nPatient: {patient_info['Q20']}",
        f"(Q21)\nDoctor: Do you feel drowsy during the day?\nPatient: {patient_info['Q21']}",
        f"(Q22)\nDoctor: Do you have trouble falling asleep or waking up in the middle of the night?\nPatient: {patient_info['Q22']}",
        f"(Q23)\nDoctor: Have you had any falls recently?\nPatient: {patient_info['Q23']}",
        f"(Q24)\nDoctor: Do you experience double vision when looking at objects, or did you have any blind spots when you took the visual field test? See Video 1.\nPatient: {patient_info['Q24']}",
        f"(Q25)\nDoctor: Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.\nPatient: {patient_info['Q25']}"
    ])

def create_history_questions_Parkinsons_Disease(patient_info):
    return "\n".join([
        f"(Q1)\nDoctor: How long has it been since you were diagnosed with Parkinson’s Disease?\nPatient: {patient_info['Q1']}",
        f"(Q2)\nDoctor: Are you currently taking levodopa?\nPatient: {patient_info['Q2']}",
        f"(Q3)\nDoctor: Do you recurrently experience shaking and times when you can't control your walking, feeling like your feet are stuck?\nPatient: {patient_info['Q3']}",
        f"(Q4)\nDoctor: Do you recurrently feel pain, excessive sweating, a fast heartbeat, stomach discomfort, or experience feelings of depression or anxiety?\nPatient: {patient_info['Q4']}",
        f"(Q5)\nDoctor: Do you have uncontrollable movements that make it hard to sit, walk, or do everyday tasks?\nPatient: {patient_info['Q5']}",
        f"(Q6)\nDoctor: Have you recently experienced moments when you suddenly couldn't move (immobility)?\nPatient: {patient_info['Q6']}",
        f"(Q7)\nDoctor: Was there an abrupt change in medication recently?\nPatient: {patient_info['Q7']}",
        f"(Q8)\nDoctor: Have you had constipation recently?\nPatient: {patient_info['Q8']}",
        f"(Q9)\nDoctor: Have you been sweating a lot recently or drinking less water recently (dehydration)?\nPatient: {patient_info['Q9']}",
        f"(Q10)\nDoctor: Have you had any injuries recently?\nPatient: {patient_info['Q10']}",
        f"(Q11)\nDoctor: Have you ever had slow movements along with a fast heartbeat or sweating?\nPatient: {patient_info['Q11']}",
        f"(Q12)\nDoctor: Have you had high fever (>39°C) recently?\nPatient: {patient_info['Q12']}",
        f"(Q13)\nDoctor: Have you had long periods of uncontrollable, jerky movements throughout your body (generalized dyskinesia)?\nPatient: {patient_info['Q13']}",
        f"(Q14)\nDoctor: Have you had diarrhea?\nPatient: {patient_info['Q14']}",
        f"(Q15)\nDoctor: Have you noticed overly strong reflexes or unusually large pupils?\nPatient: {patient_info['Q15']}",
        f"(Q16)\nDoctor: Have you recently started taking a new medication or increased the dosage of an existing one?\nPatient: {patient_info['Q16']}",
        f"(Q17)\nDoctor: Have you experienced a mix of shaking, sudden jerking movements, restlessness, or muscle stiffness?\nPatient: {patient_info['Q17']}",
        f"(Q18)\nDoctor: (To guardian) Does the patient seem to have visual hallucinations or paranoia, especially towards relatives?\nPatient: {patient_info['Q18']}",
        f"(Q19)\nDoctor: (To guardian) Does the patient have periods where his/her focus or attention comes and goes?\nPatient: {patient_info['Q19']}",
        f"(Q20)\nDoctor: (To guardian) Does the patient have confused speech or noticeable changes in behavior?\nPatient: {patient_info['Q20']}",
        f"(Q21)\nDoctor: (To guardian) Does the patient have dementia?\nPatient: {patient_info['Q21']}",
        f"(Q22)\nDoctor: (To guardian) Has the patient recently had an infection, been exposed to any toxins, or undergone surgery?\nPatient: {patient_info['Q22']}",
        f"(Q23)\nDoctor: (To guardian) Has the patient recently taken antidepressants or painkillers?\nPatient: {patient_info['Q23']}",
        f"(Q24)\nDoctor: Have you recently engaged in gambling, compulsive shopping, abnormal sexual behaviors or binge eating?\nPatient: {patient_info['Q24']}",
        f"(Q25)\nDoctor: Have you ever had obsessive-compulsive disorder or impulsive personality?\nPatient: {patient_info['Q25']}",
        f"(Q26)\nDoctor: Have you recently quit medications (possible rapid reduction of dopamine agonists)?\nPatient: {patient_info['Q26']}",
        f"(Q27)\nDoctor: Have you recently increased levodopa dose without doctor’s permission?\nPatient: {patient_info['Q27']}",
        f"(Q28)\nDoctor: Have you recently had frequent mood changes?\nPatient: {patient_info['Q28']}",
        f"(Q29)\nDoctor: Have you recently experienced lightheadedness with blurry vision on standing or walking?\nPatient: {patient_info['Q29']}",
        f"(Q30)\nDoctor: Have you recently had a hard time concentrating?\nPatient: {patient_info['Q30']}",
        f"(Q31)\nDoctor: Have you had discomfort in your head or neck after a meal?\nPatient: {patient_info['Q31']}",
        f"(Q32)\nDoctor: Have you lost consciousness?\nPatient: {patient_info['Q32']}",
        f"(Q33)\nDoctor: Do you frequently cough, choke, or experience regurgitation through your nose during meals?\nPatient: {patient_info['Q33']}",
        f"(Q34)\nDoctor: Do you frequently catch a cold or drool?\nPatient: {patient_info['Q34']}",
        f"(Q35)\nDoctor: Has the effectiveness of levodopa decreased recently?\nPatient: {patient_info['Q35']}",
        f"(Q36)\nDoctor: Have you recently experienced a swollen belly, stomach pain, or vomiting?\nPatient: {patient_info['Q36']}",
        f"(Q37)\nDoctor: Do you feel undesirable sleepiness during daytime even after enough sleep?\nPatient: {patient_info['Q37']}",
        f"(Q38)\nDoctor: Have you suddenly fallen asleep during a conversation, a meal, or driving?\nPatient: {patient_info['Q38']}",
        f"(Q39)\nDoctor: Do you often have unpleasant dreams (for example being attacked or robbed)?\nPatient: {patient_info['Q39']}",
        f"(Q40)\nDoctor: (To guardians) Does the patient show vigorous behaviors such as punching, jumping out of bed, or shouting?\nPatient: {patient_info['Q40']}",
        f"(Q41)\nDoctor: Have you been falling frequently recently?\nPatient: {patient_info['Q41']}",
        f"(Q42)\nDoctor: Have you received deep brain stimulation?\nPatient: {patient_info['Q42']}",
        f"(Q43)\nDoctor: Have you received levodopa-carbidopa intestinal gel infusion?\nPatient: {patient_info['Q43']}",
        f"(Q44)\nDoctor: Have you experienced stomach pain, flatulence or constipation?\nPatient: {patient_info['Q44']}",
        f"(Q45)\nDoctor: Have you received Apomorphine subcutaneous injections?\nPatient: {patient_info['Q45']}",
        f"(Q46)\nDoctor: Have you experienced nausea?\nPatient: {patient_info['Q46']}",
        f"(Q47)\nDoctor: Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.\nPatient: {patient_info['Q47']}"
    ])

def create_history_questions_Spinal_Cord_Injury(patient_info):
    return "\n".join([
        f"(Q1)\nDoctor: How long has it been since you were diagnosed with a spinal cord injury?\nPatient: {patient_info['Q1']}",
        f"(Q2)\nDoctor: Have you recently experienced a cough, changes in sputum color, shortness of breath, or fever?\nPatient: {patient_info['Q2']}",
        f"(Q3)\nDoctor: Have you recently had chest pain that worsens when you breathe?\nPatient: {patient_info['Q3']}",
        f"(Q4)\nDoctor: Have you been waking up frequently during sleep or noticed that your snoring has become worse?\nPatient: {patient_info['Q4']}",
        f"(Q5)\nDoctor: Have you had dizziness, lightheadedness, pallor, yawning, weakness in muscles, fatigue or syncope?\nPatient: {patient_info['Q5']}",
        f"(Q6)\nDoctor: Have you had headache or sweating?\nPatient: {patient_info['Q6']}",
        f"(Q7)\nDoctor: Have you had flushing or stuffy nose (nasal congestion)?\nPatient: {patient_info['Q7']}",
        f"(Q8)\nDoctor: Have you had trouble emptying your bladder or issues with a blocked catheter?\nPatient: {patient_info['Q8']}",
        f"(Q9)\nDoctor: Have you had sudden, uncontrolled urine leakage, leftover urine after voiding, leaks when you cough or sneeze, or trouble with constant dribbling of urine?\nPatient: {patient_info['Q9']}",
        f"(Q10)\nDoctor: Have you had severe constipation?\nPatient: {patient_info['Q10']}",
        f"(Q11)\nDoctor: Have you experienced bowel incontinence?\nPatient: {patient_info['Q11']}",
        f"(Q12)\nDoctor: Have you had unusually tight muscles (hypertonus), sudden or ongoing uncontrolled muscle reflexes (hyperreflexia), shaking or jerking movements (clonus), or painful muscle spasms?\nPatient: {patient_info['Q12']}",
        f"(Q13)\nDoctor: Have you had pain during walking or overusing arm or shoulder (for example while using a manually operated wheelchair)?\nPatient: {patient_info['Q13']}",
        f"(Q14)\nDoctor: Have you experienced burning, aching, tingling or stabbing sensations?\nPatient: {patient_info['Q14']}",
        f"(Q15)\nDoctor: Is there any damage to the skin or tissue over bony areas (bony prominence) like your hip, tailbone, or heel (ischium, trochanters, sacrum, heel)?\nPatient: {patient_info['Q15']}",
        f"(Q16)\nDoctor: (To guardians) Has the patient experienced inadequate nutrition?\nPatient: {patient_info['Q16']}",
        f"(Q17)\nDoctor: Did you feel pain while moving (transferring) from bed to chair?\nPatient: {patient_info['Q17']}",
        f"(Q18)\nDoctor: Do you have tenderness around your knees?\nPatient: {patient_info['Q18']}",
        f"(Q19)\nDoctor: Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.\nPatient: {patient_info['Q19']}"
    ])

def create_history_questions_ALS(patient_info):
    return "\n".join([
        f"(Q1)\nDoctor: How long has it been since you were diagnosed with ALS?\nPatient: {patient_info['Q1']}",
        f"(Q2)\nDoctor: Is there excessive saliva production or drooling?\nPatient: {patient_info['Q2']}",
        f"(Q3)\nDoctor: Is it difficult to cough up phlegm?\nPatient: {patient_info['Q3']}",
        f"(Q4)\nDoctor: Is there inappropriate (disinhibited) laughing or crying, or signs of anxiety?\nPatient: {patient_info['Q4']}",
        f"(Q5)\nDoctor: Have you had unusually tight muscles (hypertonus), sudden or ongoing uncontrolled muscle reflexes (hyperreflexia), shaking or jerking movements (clonus)?\nPatient: {patient_info['Q5']}",
        f"(Q6)\nDoctor: Do you have muscle cramps that are bad enough to affect your daily activities or sleep?\nPatient: {patient_info['Q6']}",
        f"(Q7)\nDoctor: Do you experience choking while swallowing food, a change in your voice after eating, difficulty swallowing, or a feeling of food stuck in your throat?\nPatient: {patient_info['Q7']}",
        f"(Q8)\nDoctor: Do you feel short of breath even at rest, or does your breathing improve when sitting up?\nPatient: {patient_info['Q8']}",
        f"(Q9)\nDoctor: Do you have sleep problems not caused by pain or mood issues, loss of appetite, morning headaches, daytime sleepiness, or trouble concentrating?\nPatient: {patient_info['Q9']}",
        f"(Q10)\nDoctor: Have you felt down, lost interest in things you usually enjoy, lacked motivation, or become more easily irritated?\nPatient: {patient_info['Q10']}",
        f"(Q11)\nDoctor: Have you felt tired, low on energy, easily worn out, sleepy, or less focused than usual (diminished alertness)?\nPatient: {patient_info['Q11']}",
        f"(Q12)\nDoctor: (To guardians) Has the patient shown a lack of motivation (apathy), trouble controlling impulses (disinhibition), difficulty with planning or decision-making (executive dysfunction), or trouble finding the right words when speaking (reduced verbal fluency)?\nPatient: {patient_info['Q12']}",
        f"(Q13)\nDoctor: Do you have difficulties in sleeping?\nPatient: {patient_info['Q13']}",
        f"(Q14)\nDoctor: Have you had muscle or joint pain, especially in your neck or shoulder?\nPatient: {patient_info['Q14']}",
        f"(Q15)\nDoctor: How old are you?\nPatient: {patient_info['Q15']}",
        f"(Q16)\nDoctor: Have you had sudden, strong urges to urinate that sometimes lead to accidental leaks?\nPatient: {patient_info['Q16']}",
        f"(Q17)\nDoctor: (If you have a blood pressure monitor) Have you measured your blood pressure two or more times, and was the systolic pressure always 140 mmHg or higher, or the diastolic pressure always 90 mmHg or higher?\nPatient: {patient_info['Q17']}",
        f"(Q18)\nDoctor: Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.\nPatient: {patient_info['Q18']}"
    ])

def create_history_questions_Peripheral_Neuropathy(patient_info):
    return "\n".join([
        f"(Q1)\nDoctor: How long has it been since you were diagnosed with peripheral neuropathy?\nPatient: {patient_info['Q1']}",
        f"(Q2)\nDoctor: Do you check your feet every day for any wounds?\nPatient: {patient_info['Q2']}",
        f"(Q3)\nDoctor: Do you keep your feet well moisturized?\nPatient: {patient_info['Q3']}",
        f"(Q4)\nDoctor: Do you have diabetes?\nPatient: {patient_info['Q4']}",
        f"(Q5)\nDoctor: Are your feet warmer than usual, or do you notice any redness or swelling?\nPatient: {patient_info['Q5']}",
        f"(Q6)\nDoctor: Have you felt a dull, deep muscle pain that feels like a toothache or cramping?\nPatient: {patient_info['Q6']}",
        f"(Q7)\nDoctor: Have you felt a burning sensation or sensitivity to pain on the surface of your skin?\nPatient: {patient_info['Q7']}",
        f"(Q8)\nDoctor: Please let me know if you have any other symptoms that are concerning, aside from what I've already asked about.\nPatient: {patient_info['Q8']}"
    ])

# Function to generate suspected diagnoses
def suspected_diagnoses(patient_info):
    # Create RAG chain
    chief_complaint = patient_info["patient_chief_complaint"]

    persist_directory1 = ""
    uploaded_file_path = ""
    if chief_complaint.lower() == "lower extremity pain":
        uploaded_file_path = "rag_data/Chief Complaint/[6]_Shoulder_Pain_Red_Flags.pdf"
        persist_directory1 = persist_directory1_Lower_Extremity
    elif chief_complaint.lower() == "upper extremity pain":
        uploaded_file_path = "rag_data/Chief Complaint/[5]_Rehab_Textbook_Upper_Extremity_Pain.pdf"
        persist_directory1 = persist_directory1_Upper_Extremity
    elif chief_complaint.lower() == "low back pain":
        uploaded_file_path = "rag_data/Chief Complaint/[8]_Rehab_Textbook_Low_Back_Pain.pdf"
        persist_directory1 = persist_directory1_Low_Back_Pain
    elif chief_complaint.lower() == "neck pain":
        uploaded_file_path = "rag_data/Chief Complaint/[9]_Rehab_Textbook_Neck_Pain.pdf"
        persist_directory1 = persist_directory1_Neck_Pain

    if os.path.exists(persist_directory1):
        print("Loading the vector store from local storage.")
        vectorstore = Chroma(
            persist_directory=persist_directory1,
            embedding_function=UpstageEmbeddings(model="solar-embedding-1-large")
        )
    else:
        print("Creating a new vector store.")
        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = os.path.join(temp_dir, os.path.basename(uploaded_file_path))
            with open(file_path, "wb") as f:
                f.write(open(uploaded_file_path, "rb").read())
            vectorstore = process_pdf_onlyfile(file_path, persist_directory1)

    if chief_complaint.lower() == "lower extremity pain":
        history_questions = create_history_questions_Lower_Extremity(patient_info)
        simple_rag_chain = create_simple_rag_chain_Lower_Extremity(vectorstore, os.getenv("UPSTAGE_API_KEY"))
    elif chief_complaint.lower() == "upper extremity pain":
        history_questions = create_history_questions_Upper_Extremity(patient_info)
        simple_rag_chain = create_simple_rag_chain_Upper_Extremity(vectorstore, os.getenv("UPSTAGE_API_KEY"))
    elif chief_complaint.lower() == "low back pain":
        history_questions = create_history_questions_Low_Back_Pain(patient_info)
        simple_rag_chain = create_simple_rag_chain_Low_Back_Pain(vectorstore, os.getenv("UPSTAGE_API_KEY"))
    elif chief_complaint.lower() == "neck pain":
        history_questions = create_history_questions_Neck_Pain(patient_info)
        simple_rag_chain = create_simple_rag_chain_Neck_Pain(vectorstore, os.getenv("UPSTAGE_API_KEY"))

    qa_human_prompt = f"""
    <Conversation>\n
    {history_questions}
    """

    response = simple_rag_chain.invoke({
        "input": qa_human_prompt,
    })

    save_patient_info(patient_info)

    return response["answer"]

# PDF processing and indexing function
def process_pdf(file_path, persist_directory):
    if os.path.exists(persist_directory):
        print(f"Loading vector store from local storage: {persist_directory}")
        return Chroma(persist_directory=persist_directory, embedding_function=UpstageEmbeddings(model="solar-embedding-1-large"))
    else:
        print(f"Creating a new vector store: {persist_directory}")
        loader = UpstageLayoutAnalysisLoader(
            file_path, use_ocr=True, output_type="html"
        )
        pages = loader.load_and_split()
        vectorstore = Chroma.from_documents(pages, UpstageEmbeddings(model="solar-embedding-1-large"), persist_directory=persist_directory)
        return vectorstore

# Function to create RAG chain
def create_rag_chain(vectorstore, api_key, system_prompt):
    chat = ChatUpstage(upstage_api_key=api_key, temperature=0)
    retriever = vectorstore.as_retriever(k=2)
    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{context}"),
    ])
    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain


def calculate_7day_average(file_path, date=None):
    """
    Calculates the average of data within 7 days from the specified date in the given CSV file.
    If the file is empty or contains no valid data, returns a list of zeros.

    :param file_path: Path to the CSV file
    :param date: Reference date (default: None, uses today's date if None)
    :return: List of 7-day average values for each item, or zeros if no data
    """
    try:
        df = pd.read_csv(file_path, parse_dates=['datetime'])
        df_len = len(df.columns)-1
    except pd.errors.EmptyDataError:
        return [0] * df_len  # Return list of zeros if file is empty
    if df.empty or len(df) == 0:
        return [0] * df_len  # Return list of zeros if DataFrame is empty

    if date is None:
        date = datetime.now()
    elif isinstance(date, str):
        date = datetime.strptime(date, "%Y-%m-%d")

    seven_days_ago = date - timedelta(days=7)
    df_recent = df[df['datetime'] > seven_days_ago]

    if df_recent.empty:
        return [0] * df_len  # Return list of zeros if no data within 7 days
    averages = []
    for item in range(1, df_len+1):
        column_name = f'Item {item}'
        avg = df_recent[column_name].mean()
        averages.append(round(avg, 2) if not pd.isna(avg) else 0)

    return averages

def input_item_scores(file_path):
    """
    Function to input scores for Items from the user or load from existing file.

    :param file_path: Path to the CSV file
    :return: List containing item scores
    """
    today = datetime.now().strftime("%m/%d/%Y")  # Format: M/D/YYYY

    if os.path.exists(file_path):
        df = pd.read_csv(file_path, parse_dates=['datetime'])
        df['datetime'] = pd.to_datetime(df['datetime'])
        today_data = df[df['datetime'].dt.strftime("%-m/%-d/%Y") == today]

        if not today_data.empty:
            latest_scores = today_data.iloc[-1, 1:].tolist()
            print(f"Loaded today's scores ({today}) from existing file.")
            return latest_scores
        else:
            print(f"No scores found for today ({today}). Please input current scores.")
    else:
        print("No existing file found. Please input current scores.")

    scores = []
    for i in range(1, 18):
        while True:
            try:
                score = float(input(f"Enter the score for Item {i}: "))
                scores.append(score)
                break
            except ValueError:
                print("Please enter a valid number.")

    # Save the new scores to the CSV file
    new_row = [today] + scores
    new_df = pd.DataFrame([new_row], columns=['datetime'] + [f'Item {i}' for i in range(1, 18)])

    if os.path.exists(file_path):
        existing_df = pd.read_csv(file_path)
        updated_df = pd.concat([existing_df, new_df], ignore_index=True)
        updated_df.to_csv(file_path, index=False, date_format='%-m/%-d/%Y')
    else:
        new_df.to_csv(file_path, index=False, date_format='%-m/%-d/%Y')

    print(f"Saved today's scores ({today}) to file.")
    return scores

def compare_scores(item_scores, average_scores):
    decreased_items = []
    for i, (current, average) in enumerate(zip(item_scores, average_scores)):
        if current < average:
            decreased_items.append('Item '+str(i+1))

    return decreased_items

def get_rehabilitation_evaluation(decreased_items, patient_info):
    uploaded_file_path1 = "rag_data/Disability/[3]_Cognition_Training.pdf"
    uploaded_file_path2 = "rag_data/Disability/[10]_PTX.pdf"
    uploaded_file_path3 = "rag_data/Disability/[10]_PTX.pdf"

    vectorstore1 = process_pdf(uploaded_file_path1, persist_directory2_Cognition)
    vectorstore2 = process_pdf(uploaded_file_path2, persist_directory2_Upper_Extremity)
    vectorstore3 = process_pdf(uploaded_file_path3, persist_directory2_Movement)

    system_prompt = """You are a renowned rehabilitation medicine specialist. Evaluate physical functions related to patient's disabilities and give feedbacks.

    1. In {context}, find rehabilitation training related to <ITEMs> among <Patient_disability>.

    2. Educate the training content to the patient in plain English.
    """

    rag_chain1 = create_rag_chain(vectorstore1, os.getenv("UPSTAGE_API_KEY"), system_prompt)
    rag_chain2 = create_rag_chain(vectorstore2, os.getenv("UPSTAGE_API_KEY"), system_prompt)
    rag_chain3 = create_rag_chain(vectorstore3, os.getenv("UPSTAGE_API_KEY"), system_prompt)

    total_answer=""
    for i in range(len(patient_info)):
        total_answer+="\n"
        subcategories =[]

        print(patient_info[i])
        print(decreased_items[i])
        for j in range(len(decreased_items[i])):
            subcategories +=[matching[patient_info[i]][decreased_items[i][j]]]

        print(subcategories)
        qa_human_prompt = f"""
        Patient_disability:
        {patient_info[i]}

        ITEMs:
        {subcategories}"""

        if (patient_info[i]=="Cognition"):
            response = rag_chain1.invoke({"input": qa_human_prompt})
            print(total_answer)
            total_answer += response["answer"]
        elif (patient_info[i]=="UpperExtremity"):
            response = rag_chain2.invoke({"input": qa_human_prompt})
            total_answer += response["answer"]    
        elif (patient_info[i]=="Movement"):
            response = rag_chain3.invoke({"input": qa_human_prompt})
            total_answer += response["answer"]     

    return total_answer

# Function to generate suspected diagnoses
def suspected_complications(patient_info, diagnosis):

    persist_directory3 = ""

    if diagnosis.lower() == "traumatic brain injury":
        uploaded_file_path = "rag_data/Complications/[2]_Traumatic_Brain_Injury_Complications.pdf"
        persist_directory3 = persist_directory3_Traumatic_Brain_Injury
    elif diagnosis.lower() == "stroke":
        uploaded_file_path = "rag_data/Complications/[3]_Stroke_Complications.pdf"
        persist_directory3 = persist_directory3_Stroke
    elif diagnosis.lower() == "parkinsons disease":
        uploaded_file_path = "rag_data/Complications/[4]_Parkinsons_Disease_Complications.pdf"
        persist_directory3 = persist_directory3_Parkinsons_Disease
    elif diagnosis.lower() == "spinal cord injury":
        uploaded_file_path = "rag_data/Complications/[5]_Spinal_Cord_Injury_Complications.pdf"
        persist_directory3 = persist_directory3_Spinal_Cord_Injury
    elif diagnosis.lower() == "als":
        uploaded_file_path = "rag_data/Complications/[6]_ALS_Complications.pdf"
        persist_directory3 = persist_directory3_ALS
    elif diagnosis.lower() == "peripheral neuropathy":
        uploaded_file_path = "rag_data/Complications/[7]_Peripheral_Neuropathy_Complications.pdf"
        persist_directory3 = persist_directory3_Peripheral_Neuropathy

    if os.path.exists(persist_directory3):
        print("Loading the vector store from local storage.")
        vectorstore = Chroma(
            persist_directory=persist_directory3,
            embedding_function=UpstageEmbeddings(model="solar-embedding-1-large")
        )
    else:
        print("Creating a new vector store.")
        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = os.path.join(temp_dir, os.path.basename(uploaded_file_path))
            with open(file_path, "wb") as f:
                f.write(open(uploaded_file_path, "rb").read())
            vectorstore = process_pdf_onlyfile(file_path, persist_directory3)

    # Create RAG chain
    if diagnosis.lower() == "traumatic brain injury":
        history_questions = create_history_questions_Traumatic_Brain_Injury(patient_info)
        simple_rag_chain = create_simple_rag_chain_Traumatic_Brain_Injury(vectorstore, os.getenv("UPSTAGE_API_KEY"))
    elif diagnosis.lower() == "stroke":
        history_questions = create_history_questions_Stroke(patient_info)
        simple_rag_chain = create_simple_rag_chain_Stroke(vectorstore, os.getenv("UPSTAGE_API_KEY"))
    elif diagnosis.lower() == "parkinsons disease":
        history_questions = create_history_questions_Parkinsons_Disease(patient_info)
        simple_rag_chain = create_simple_rag_chain_Parkinsons_Disease(vectorstore, os.getenv("UPSTAGE_API_KEY"))
    elif diagnosis.lower() == "spinal cord injury":
        history_questions = create_history_questions_Spinal_Cord_Injury(patient_info)
        simple_rag_chain = create_simple_rag_chain_Spinal_Cord_Injury(vectorstore, os.getenv("UPSTAGE_API_KEY"))
    elif diagnosis.lower() == "als":
        history_questions = create_history_questions_ALS(patient_info)
        simple_rag_chain = create_simple_rag_chain_ALS(vectorstore, os.getenv("UPSTAGE_API_KEY"))
    elif diagnosis.lower() == "peripheral neuropathy":
        history_questions = create_history_questions_Peripheral_Neuropathy(patient_info)
        simple_rag_chain = create_simple_rag_chain_Peripheral_Neuropathy(vectorstore, os.getenv("UPSTAGE_API_KEY"))

    print("Using saved patient information.")

    qa_human_prompt = f"""
    <Conversation>\n
    {history_questions}
    """

    response = simple_rag_chain.invoke({
        "input": qa_human_prompt,
    })

    return response["answer"]