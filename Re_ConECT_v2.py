# -*- coding: utf-8 -*-

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
from langchain_upstage import UpstageDocumentParseLoader
from langchain.schema import Document
import pandas as pd
from datetime import timedelta

# Load environment variables
load_dotenv()
# Generate a session ID
session_id = uuid.uuid4()
# Set directory for vector storage

# Load environment variables
load_dotenv()
# Generate a session ID
session_id = uuid.uuid4()
# Set directory for vector storage
persist_directory1_Lower_Extremity = "db_data/chroma_db1_Lower_Extremity"
persist_directory1_Upper_Extremity = "db_data/chroma_db1_Upper_Extremity"
persist_directory1_Low_Back_Pain = "db_data/chroma_db1_Low_Back_Pain"
persist_directory1_Neck_Pain = "db_data/chroma_db1_Neck_Pain"

persist_directory2_Cognition = "db_data/chroma_db2_Cognition_new"
persist_directory2_Upper_Extremity = "db_data/chroma_db2_Upper_Extremity"
persist_directory2_Movement = "db_data/chroma_db2_Movement"

persist_directory3_Traumatic_Brain_Injury = "db_data/chroma_db3_Traumatic_Brain_Injury"
persist_directory3_Stroke = "db_data/chroma_db3_Stroke"
persist_directory3_Parkinsons_Disease = "db_data/chroma_db3_Parkinsons_Disease"
persist_directory3_Spinal_Cord_Injury = "db_data/chroma_db3_Spinal_Cord_Injury"
persist_directory3_ALS = "db_data/chroma_db3_ALS"
persist_directory3_Peripheral_Neuropathy = "db_data/chroma_db3_Peripheral_Neuropathy"


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
def save_patient_info(patient_info, ID, Password):
    with open(f"db_data/patient_info_{ID}_{Password}.json", 'w') as f:
        json.dump(patient_info, f)
    print(f"Patient information saved to db_data/patient_info_{ID}_{Password}.json")



def process_pdf(file_path, persist_directory):
    after_trans = []
    if os.path.exists(persist_directory):
        print(f"Loading vector store from local storage: {persist_directory}")
        return Chroma(persist_directory=persist_directory, embedding_function=UpstageEmbeddings(model="solar-embedding-1-large"))
    else:
        chat = ChatUpstage(model="solar-1-mini-translate-koen")
        print(f"Creating a new vector store: {persist_directory}")
        loader = UpstageLayoutAnalysisLoader(
            file_path, use_ocr=True, output_type="html"
        )
        loader = UpstageDocumentParseLoader(file_path)
        pages = loader.load()

        split_docs = split_document(pages[0].page_content)
        korean_pattern = re.compile(r'[\uAC00-\uD7A3]+')    
        if korean_pattern.match(split_docs[0]):
            for text in split_docs:
                messages = [
                    HumanMessage(content=text),
                ]
                response = chat.invoke(messages)
                after_trans.append(response.content)
            documents = [Document(page_content=text, metadata={"category": "paragraph"}) for text in after_trans]
        else:
            documents = [Document(page_content=text, metadata={"category": "paragraph"}) for text in split_docs]

        vectorstore = Chroma.from_documents(documents, UpstageEmbeddings(model="solar-embedding-1-large"), persist_directory="db_data/chroma_db2_Cognition_new")

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
        today_data = df[df['datetime'].dt.strftime("%m/%d/%Y") == today]

        if not today_data.empty:
            latest_scores = today_data.iloc[-1, 1:].tolist()
            print(f"Loaded today's scores ({today}) from existing file.")
            return latest_scores
        else:
            print(f"No scores found for today ({today}). Please input current scores.")
    else:
        print("No existing file found. Please input current scores.")

    scores = []
    for i in range(1, len(df.columns)):
        while True:
            try:
                score = float(input(f"Enter the score for Item {i}: "))
                scores.append(score)
                break
            except ValueError:
                print("Please enter a valid number.")

    # Save the new scores to the CSV file
    new_row = [today] + scores
    new_df = pd.DataFrame([new_row], columns=['datetime'] + [f'Item {i}' for i in range(1, len(df.columns))])

    if os.path.exists(file_path):
        existing_df = pd.read_csv(file_path)
        updated_df = pd.concat([existing_df, new_df], ignore_index=True)
        updated_df.to_csv(file_path, index=False, date_format='%m/%d/%Y')
    else:
        new_df.to_csv(file_path, index=False, date_format='%m/%d/%Y')

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

    persist_directory2_Cognition = "db_data/chroma_db2_Cognition_new"
    persist_directory2_Upper_Extremity = "db_data/chroma_db2_Upper_Extremity"
    persist_directory2_Movement = "db_data/chroma_db2_Movement"

    vectorstore1 = process_pdf(uploaded_file_path1, persist_directory2_Cognition)
    vectorstore2 = process_pdf(uploaded_file_path2, persist_directory2_Upper_Extremity)
    vectorstore3 = process_pdf(uploaded_file_path3, persist_directory2_Movement)

    system_prompt = """You are a renowned rehabilitation medicine specialist. Evaluate physical functions related to patient's disabilities and give feedbacks.

        1. In {context}, find rehabilitation training related to <ITEMs> among <Patient_disability>.
        - Provide only rehabilitation training that can be done at home without the help of medical professionals.
        - Explain the rehabilitation methods in steps so that non-medical professionals can follow them.

        2. Educate the training content to the patient in plain English.

        ## Response Format

        ⚑ recommanded training: [give 3 training]
        1. [Test Name]
            - Description:
        2. [Test Name]
            - Description:
        3. [Test Name]
            - Description:
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

        total_answer += f"\nDecreased items: {subcategories}\n\n"
        if (patient_info[i]=="Cognition"):
            response = rag_chain1.invoke({"input": qa_human_prompt})
            total_answer += response["answer"]
        elif (patient_info[i]=="UpperExtremity"):
            response = rag_chain2.invoke({"input": qa_human_prompt})
            total_answer += response["answer"]
        elif (patient_info[i]=="Movement"):
            response = rag_chain3.invoke({"input": qa_human_prompt})
            total_answer += response["answer"]

    return total_answer




# Function to generate suspected complication
def suspected_complications(patient_info, diagnosis):

    patient_info["patient_chief_complaint"] = diagnosis

    pdf_paths_and_directories = {
        "Traumatic Brain Injury": {
            "directory": "db_data/chroma_db3_Traumatic_Brain_Injury_new",
            "path": "rag_data/Complications/[2]_Traumatic_Brain_Injury_Complications_new.pdf"
        },
        "Stroke": {
            "directory": "db_data/chroma_db3_Stroke_new1",
            "path": "rag_data/Complications/[3]_Stroke_Complications_new.pdf"
        },
        "Parkinsons Disease": {
            "directory": "db_data/chroma_db3_Parkinsons_Disease",
            "path": "rag_data/Complications/[4]_Parkinsons_Disease_Complications.pdf"
        },
        "Spinal Cord Injury": {
            "directory": "db_data/chroma_db3_Spinal_Cord_Injury",
            "path": "rag_data/Complications/[5]_Spinal_Cord_Injury_Complications.pdf"
        },
        "ALS": {
            "directory": "db_data/chroma_db3_ALS",
            "path": "rag_data/Complications/[6]_ALS_Complications.pdf"
        },
        "Peripheral Neuropathy": {
            "directory": "db_data/chroma_db3_Peripheral_Neuropathy",
            "path": "rag_data/Complications/[7]_Peripheral_Neuropathy_Complications.pdf"
        }
    }

    if diagnosis in pdf_paths_and_directories:
        selected_directory = pdf_paths_and_directories[diagnosis]["directory"]
        selected_pdf_path = pdf_paths_and_directories[diagnosis]["path"]

        vectorstore = process_pdf(selected_pdf_path, selected_directory)
        print(f"Processed {selected_pdf_path} and stored in {selected_directory}")
    else:
        print(f"No matching chief complaint found for: {diagnosis}")

    top_3_diseases = calculate_disease_scores(diagnosis, patient_info)

    system_prompt1 = """Please provide further evaluations and treatments of {suspected_complication} with {context}.

    Further evaluations are tests to confirm the diagnosis of {suspected_complication} itself.
    Treatments are direct treatments, not treatments for factors of {suspected_complication}.

    **Further Evaluations:**
    1. Explain the additional evaluations in simple terms that an 18-year-old high school graduate can easily understand.
    2. Remove all abbreviations and fully explain all terms.
    3. Clearly state the names of the necessary tests in an easy-to-understand manner.

    **Treatments:**
    - Gather as much relevant information as possible and explain it in a friendly and easy-to-understand way.
    - List primarily treatments that can be performed at home.

    ## Response Format
    ⚑ Possible complication : {suspected_complication}

    ⚑ Further Evaluations:
      1. [Test Name]
          - Purpose:
          - Expected Results:
      2. [Test Name]
          - Purpose:
          - Expected Results:
      3. [Test Name]
          - Purpose:
          - Expected Results:

    ⚑ Treatments: [give 3 treatments]
      1. [Test Name]
          - Description:
      2. [Test Name]
          - Description:
      3. [Test Name]
          - Description:"""


    rag_chain1 = create_rag_chain(vectorstore, os.getenv("UPSTAGE_API_KEY"), system_prompt1)

    results_list = []
    disease_list = []

    for complication, probability in top_3_diseases:
        print(top_3_diseases)
        qa_human_prompt = f"""
        Please provide further evaluations and treatments over {complication}.
        """
        response = rag_chain1.invoke({
            "input": qa_human_prompt,
            "suspected_complication": complication,
        })

        results_list.append(response['answer'])
        disease_list.append(complication)
    final_answer=""
    for i in range(len(results_list)):
        final_answer += f"\n {disease_list[i]}:\n"
        final_answer += f"{results_list[i]}\n"

    return final_answer

def load_disease_data_by_type(data_type, base_folder='diagnosis_json_data'):
    """
    Function to load four types of JSON files stored in a folder and restore them as a dictionary.

    Args:
    - data_type: Type of data (e.g., 'type1', 'type2', 'type3', 'type4')
    - base_folder: Base folder path to load the data from (default: 'diagnosis_json_data')

    Returns:
    - Restored data in the form of a dictionary (including diseases_dict and rules)
    """
    diseases_dict = {}
    rules = []
    ["lower extremity pain", "upper extremity pain", "low back pain", "neck pain"]

    type_folder = os.path.join(base_folder, data_type)

    if not os.path.exists(type_folder):
        print(f"{type_folder} folder not exist.")
        return None

    for disease_folder in os.listdir(type_folder):
        disease_path = os.path.join(type_folder, disease_folder)

        json_file_path = os.path.join(disease_path, 'data.json')
        if os.path.exists(json_file_path):
            with open(json_file_path, 'r') as json_file:
                data = json.load(json_file)
                diseases_dict[data['disease']] = data['count']
                rules.extend(data['related_rules'])

    return diseases_dict, rules

def calculate_disease_scores(category, question_dict):
    category_mapping = {
        "neck pain": "Chief_Complaint/Neck_Pain",
        "lower extremity pain": "Chief_Complaint/Lower_Extremity",
        "upper extremity pain": "Chief_Complaint/Upper_Extremity",
        "low back pain": "Chief_Complaint/Low_Back_Pain",
        "traumatic brain injury": "Complication/Traumatic_Brain_Injury",
        "stroke": "Complication/Stroke",
        "parkinsons disease": "Complication/Parkinsons_Disease",
        "spinal cord injury": "Complication/Spinal_Cord_Injury",
        "als": "Complication/ALS",
        "peripheral neuropathy": "Complication/Peripheral_Neuropathy"
    }
    category = category_mapping.get(category.lower(), category)

    diseases_dict, rules = load_disease_data_by_type(category)

    if diseases_dict is None or rules is None:
        print(f"No data found for category {category}")
        return []

    disease_scores = {disease: 0 for disease in diseases_dict.keys()}

    for rule in rules:
        if question_dict.get(rule['question']) == rule['answer']:
            for disease in rule['diseases']:
                intercept = rule['intercept']
                weight = rule['weight']
                total_diseases = diseases_dict[disease]
                score = (intercept * weight) / total_diseases
                disease_scores[disease] += score

    sorted_disease_scores = sorted(disease_scores.items(), key=lambda x: x[1], reverse=True)

    return sorted_disease_scores[:3]

def calculate_red_flags(questions_dict, data_type):
    """
    Function to load Red Flags rules from a file based on the given data_type and calculate the Red Flags score.

    Args:
    - questions_dict: Dictionary containing questions and answers
    - data_type: Type of data (e.g., 'Neck_Pain', 'Lower_Extremity', 'Upper_Extremity', 'Low_Back_Pain')

    Returns:
    - red_flags_score: Calculated Red Flags score
    """
    category_mapping = {
        "neck pain": "Neck_Pain",
        "lower extremity pain": "Lower_Extremity",
        "upper extremity pain": "Upper_Extremity",
        "low back pain": "Low_Back_Pain"
    }
    data_type = category_mapping.get(data_type.lower(), data_type)

    red_flags_score = 0
    base_folder = 'diagnosis_json_data/Chief_Complaint'
    type_folder = os.path.join(base_folder, data_type)
    red_flags_folder = os.path.join(type_folder, f'red_flags_{data_type}')
    json_file_path = os.path.join(red_flags_folder, 'red_flags_data.json')
    txt = ""

    try:
        with open(json_file_path, 'r') as json_file:
            data = json.load(json_file)
            red_flags_rules = data.get('related_rules', [])
    except FileNotFoundError:
        print(f"Cannot find the Red Flags data file for {data_type}: {json_file_path}")
        return red_flags_score

    for rule in red_flags_rules: # red_flags_rules
        if '&' in rule['question']:
            questions = rule['question'].split(' & ')
            condition = rule['answer']

            local_vars = {}
            for q in questions:
                answer = questions_dict.get(q)
                try:
                    local_vars[q] = int(answer)
                except (ValueError, TypeError):
                    local_vars[q] = answer

            try:
                if eval(condition, {}, local_vars):
                    red_flags_score += rule['weight']
            except Exception as e:
                print(f"Errors about {rule['question']}: {e}")
        else:
            q = rule['question']
            expected_answer = rule['answer']
            actual_answer = questions_dict.get(q)

            try:
                actual_answer_num = int(actual_answer)
                expected_answer_num = int(expected_answer)
                if actual_answer_num == expected_answer_num:
                    red_flags_score += rule['weight']
            except (ValueError, TypeError):
                if actual_answer == expected_answer:
                    red_flags_score += rule['weight']

    if red_flags_score > 0:
        print(f"Red flags have been detected for {data_type}. Hospital visit is recommended for further evaluations.")
        txt = f"Red flags have been detected for {data_type}. Hospital visit is recommended for further evaluations."

    return red_flags_score, txt


def suspected_diagnoses(patient_info, ID, Password):

    chief_complaint = patient_info["patient_chief_complaint"]

    pdf_paths_and_directories = {
        "lower extremity pain": {
            "directory": "db_data/chroma_db1_Lower_Extremity_new1",
            "path": "rag_data/Chief Complaint/[1]_Rehab_Textbook_Lower_Extremity_Pain_new.pdf"
        },
        "upper extremity pain": {
            "directory": "db_data/chroma_db1_Upper_Extremity",
            "path": "rag_data/Chief Complaint/[5]_Rehab_Textbook_Upper_Extremity_Pain.pdf"
        },
        "low back pain": {
            "directory": "db_data/chroma_db1_Low_Back_Pain",
            "path": "rag_data/Chief Complaint/[8]_Rehab_Textbook_Low_Back_Pain.pdf"
        },
        "neck pain": {
            "directory": "db_data/chroma_db1_Neck_Pain_new",
            "path": "rag_data/Chief Complaint/[9]_Rehab_Textbook_Neck_Pain_new.pdf"
        }
    }

    if chief_complaint in pdf_paths_and_directories:
        selected_directory = pdf_paths_and_directories[chief_complaint]["directory"]
        selected_pdf_path = pdf_paths_and_directories[chief_complaint]["path"]

        vectorstore = process_pdf(selected_pdf_path, selected_directory)
        print(f"Processed {selected_pdf_path} and stored in {selected_directory}")
    else:
        print(f"No matching chief complaint found for: {chief_complaint}")

    uploaded_file_path2 = "rag_data/Disability/[10]_PTX.pdf"
    persist_directory2_Upper_Extremity = selected_directory
    vectorstore2 = process_pdf(uploaded_file_path2, persist_directory2_Upper_Extremity)
    
    top_3_diseases = calculate_disease_scores(chief_complaint, patient_info)

    system_prompt1 = """Please provide further evaluations and treatments of {suspected_diagnoses} with {context}.

    Further evaluations are tests to confirm the diagnosis of {suspected_diagnoses} itself.
    Treatments are direct treatments, not treatments for factors of {suspected_diagnoses}.

    **Further Evaluations:**
    1. Explain the additional evaluations in simple terms that an 18-year-old high school graduate can easily understand.
    2. Remove all abbreviations and fully explain all terms.
    3. Clearly state the names of the necessary tests in an easy-to-understand manner.

    **Treatments:**
    - Gather as much relevant information as possible and explain it in a friendly and easy-to-understand way.
    - List primarily treatments that can be performed at home.

    ## Response Format
    Possible diagnosis : {suspected_diagnoses}

    ⚑ Further Evaluations:
      1. [Test Name]
          - Purpose:
          - Expected Results:
      2. [Test Name]
          - Purpose:
          - Expected Results:
      3. [Test Name]
          - Purpose:
          - Expected Results:

    ⚑ Treatments: [give 3 treatments]
      1. [Test Name]
          - Description:
      2. [Test Name]
          - Description:
      3. [Test Name]
          - Description:"""

    system_prompt2 = """Please provide recommended exercises of {suspected_diagnoses} with {context}.

    **recommended exercises:**
    - Gather as much relevant information as possible and explain it in a friendly and easy-to-understand way.
    - List primarily exercises that can be performed at home.

    ## Response Format

    ⚑ recommand exercise: [give 3 exercise]
      1. [Test Name]
          - Description:
      2. [Test Name]
          - Description:
      3. [Test Name]
          - Description:"""

    rag_chain1 = create_rag_chain(vectorstore, os.getenv("UPSTAGE_API_KEY"), system_prompt1)
    rag_chain2 = create_rag_chain(vectorstore2, os.getenv("UPSTAGE_API_KEY"), system_prompt2)


    results_list = []
    disease_list = []
    exercise_list = []

    for disease, probability in top_3_diseases:
        qa_human_prompt = f"""
        Please provide further evaluations and treatments over {disease}.
        """

        response = rag_chain1.invoke({
            "input": qa_human_prompt,
            "suspected_diagnoses": disease,
        })

        response2 = rag_chain2.invoke({
            "input": qa_human_prompt,
            "suspected_diagnoses": disease,
        })


        results_list.append(response['answer'])
        disease_list.append(disease)
        exercise_list.append(response2['answer'])

    score, txt = calculate_red_flags(patient_info, chief_complaint)
    print(f"Red flags score: {score}")

    save_patient_info(patient_info, ID, Password)

    final_sentences=""
    for i in range(len(disease_list)):
        final_sentences += f"\n {disease_list[i]}:\n"
        final_sentences += f"{exercise_list[i]}\n"
        final_sentences += f"{results_list[i]}\n"
    final_sentences += f"\nRed flags score: {score} \n\n"
    final_sentences += txt

    return disease_list, results_list, exercise_list, score, final_sentences



