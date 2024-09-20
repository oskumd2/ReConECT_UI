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
persist_directory = "content/drive/MyDrive/240814_Llama_RAG/chroma_db"
persist_directory1 = "content/drive/MyDrive/240814_Llama_RAG/chroma_db1"
persist_directory2 = "content/drive/MyDrive/240814_Llama_RAG/chroma_db2"

# Set the path for saving patient information
patient_info_path = "content/drive/MyDrive/240814_Llama_RAG/patient_info.json"

# Function to process and index PDF files
def process_pdf_onlyfile(file_path):
    loader = UpstageLayoutAnalysisLoader(
        file_path, use_ocr=True, output_type="html"
    )
    pages = loader.load_and_split()
    vectorstore = Chroma.from_documents(pages, UpstageEmbeddings(model="solar-embedding-1-large"), persist_directory=persist_directory)
    return vectorstore

def create_simple_rag_chain(vectorstore, api_key):
    from langchain_upstage import ChatUpstage
    chat = ChatUpstage(upstage_api_key=api_key, temperature=0)

    retriever = vectorstore.as_retriever(k=2)

    qa_system_prompt = """You are a renowned rehabilitation medicine specialist. Check the patient's condition and suggest suspected diagnoses.

    1. Check the patient's condition:
       a) Chief complaint: <Chief_complaint>
       b) History taking:
          <History_questions>
       c) Physical examinations:
          <Physical_examination_questions>

    2. Suggest maximum 3 suspected diagnoses based on <History_questions> and <Physical_examination_questions>.
       Use the [DIFFERENTIAL DIAGNOSIS] section of the {context}. If no match, suggest "unspecified neck pain".

    ## Response Format
    ⚑ Answer:
    ⚑ Evidence per Answer:

    """

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", qa_system_prompt),
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain

# Function to gather user input for patient information
def get_user_input():
    patient_info = {}
    questions = [
        ("patient_chief_complaint", "Enter patient's chief complaint: ", lambda x: len(x) > 0),
        ("patient_location", "Enter patient's pain location (e.g. Middle, right): ", lambda x: len(x) > 0),
        ("patient_radiation", "Is there pain radiation? (Yes/No, and location if Yes): ", lambda x: x.lower() in ['yes', 'no'] or (x.lower().startswith('yes') and len(x) > 3)),
        ("patient_severity", "Enter pain severity (mild/moderate/severe): ", lambda x: re.search(r'\b(extremely\s+)?(mild|moderate|severe)\b', x.lower()) is not None),
        ("patient_alleviating_factors", "Is pain reduced by lying down? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_pain_increase", "Pain increase when looking at (aching/opposite/same) side: ", lambda x: x.lower() in ['aching', 'opposite', 'same']),
        ("patient_numbness_or_tingling", "Numbness or tingling in arm or hand? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_weakness", "Weaker or thinner arm than before? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_onset_of_pain", "When did the pain start? ", lambda x: len(x) > 0),
        ("patient_trauma_history", "Did pain start within 1 day of trauma? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_lower_back_pain", "Pain also in lower back? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_morning_stiffness", "Stiffness in morning? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_leg_symptoms", "Leg weakness or pain? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_coronary_heart_disease_history", "History of coronary heart disease? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_weight_loss_appetite", "Weight loss or decreased appetite? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_pregnancy_breastfeeding", "Pregnant or breast feeding? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_prolonged_sitting", "Prolonged sitting during work? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_fever", "Fever? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_cancer_steroid_history", "History of cancer or steroid use? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_osteoporosis", "Osteoporosis? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_age", "Patient's age: ", lambda x: x.isdigit() and 0 < int(x) < 120),
        ("patient_alcohol_drug_use", "Alcoholic or drug abuse? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_HIV_status", "HIV? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_leg_bending_difficulty", "Difficult to bend leg? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_urinary_fecal_incontinence", "Urinary or fecal incontinence? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_shoulder_drooping_or_winging", "Shoulder drooping or winging? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_upper_neck_tenderness", "Tenderness at upper neck? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_arm_lift_score", "Arm lift against gravity score (0-5): ", lambda x: x.isdigit() and 0 <= int(x) <= 5),
        ("patient_Babinski_Reflex", "Babinski Reflex (positive/negative): ", lambda x: x.lower() in ['positive', 'negative']),
        ("patient_sensation_in_arms", "Sensation difference between arms? (Yes/No): ", lambda x: x.lower() in ['yes', 'no']),
        ("patient_Spurling_test", "Spurling test result (positive/negative): ", lambda x: x.lower() in ['positive', 'negative'])
    ]

    total_questions = len(questions)

    for i, (key, question, validator) in enumerate(questions, 1):
        while True:
            answer = input(question)
            if validator(answer):
                patient_info[key] = answer
                progress = (i / total_questions) * 100
                print(f"Progress: {progress:.1f}%")
                break
            else:
                print("Invalid input. Please try again.")

    return patient_info

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

# Function to create history questions based on patient information
def create_history_questions(patient_info):
    return "\n".join([
        f"- Location (e.g. upper-lower, left-right): {patient_info['patient_location']}",
        f"- Radiation (include radiating location): {patient_info['patient_radiation']}",
        f"- Severity (severe/moderate/mild): {patient_info['patient_severity']}",
        f"- Pain reduced by recumbency (lying down): {patient_info['patient_alleviating_factors']}",
        f"- More painful when looking at aching side vs opposite side vs same: {patient_info['patient_pain_increase']}",
        f"- Numbness or tingling in arm or hand: {patient_info['patient_numbness_or_tingling']}",
        f"- Weaker or thinner arm than before: {patient_info['patient_weakness']}",
        f"- When did the pain start: {patient_info['patient_onset_of_pain']}",
        f"- Did the pain start within 1 day of a trauma (e.g. traffic accident, lifting): {patient_info['patient_trauma_history']}",
        f"- Pain also in lower back: {patient_info['patient_lower_back_pain']}",
        f"- Stiffness in morning: {patient_info['patient_morning_stiffness']}",
        f"- Leg weakness or pain: {patient_info['patient_leg_symptoms']}",
        f"- History of coronary heart disease: {patient_info['patient_coronary_heart_disease_history']}",
        f"- Weight loss or decreased appetite: {patient_info['patient_weight_loss_appetite']}",
        f"- Pregnant or breast feeding: {patient_info['patient_pregnancy_breastfeeding']}",
        f"- Prolonged sitting during work: {patient_info['patient_prolonged_sitting']}",
        f"- Fever: {patient_info['patient_fever']}",
        f"- History of cancer or steroid use: {patient_info['patient_cancer_steroid_history']}",
        f"- Osteoporosis: {patient_info['patient_osteoporosis']}",
        f"- Age: {patient_info['patient_age']}",
        f"- Alcoholic or drug abuse: {patient_info['patient_alcohol_drug_use']}",
        f"- HIV: {patient_info['patient_HIV_status']}",
        f"- Difficult to bend leg (leg spasticity): {patient_info['patient_leg_bending_difficulty']}",
        f"- Urinary or fecal incontinence: {patient_info['patient_urinary_fecal_incontinence']}"
    ])

# Function to create physical examination questions based on patient information
def create_physical_exam_questions(patient_info):
    return "\n".join([
        f"- Shoulder drooping or winging: {patient_info['patient_shoulder_drooping_or_winging']}",
        f"- Tenderness at upper neck: {patient_info['patient_upper_neck_tenderness']}",
        f"- Arm lift against gravity score (0-5): {patient_info['patient_arm_lift_score']}",
        f"- Babinski Reflex (positive/negative): {patient_info['patient_Babinski_Reflex']}",
        f"- Sensation difference between arms: {patient_info['patient_sensation_in_arms']}",
        f"- Spurling test result (positive/negative): {patient_info['patient_Spurling_test']}"
    ])

# Function to generate suspected diagnoses
def suspected_diagnoses(patient_info):
    uploaded_file_path = "content/drive/MyDrive/240814_Llama_RAG/1_Neck_Pain.pdf"

    if os.path.exists(persist_directory):
        print("Loading the vector store from local storage.")
        vectorstore = Chroma(
            persist_directory=persist_directory,
            embedding_function=UpstageEmbeddings(model="solar-embedding-1-large")
        )
    else:
        print("Creating a new vector store.")
        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = os.path.join(temp_dir, os.path.basename(uploaded_file_path))
            with open(file_path, "wb") as f:
                f.write(open(uploaded_file_path, "rb").read())
            vectorstore = process_pdf_onlyfile(file_path)

    # Create RAG chain
    simple_rag_chain = create_simple_rag_chain(vectorstore, os.getenv("UPSTAGE_API_KEY"))

    #patient_info = load_patient_info()

    if not patient_info:
        patient_info = get_user_input()
        save_patient_info(patient_info)
    else:
        print("Using saved patient information.")

    chief_complaint = patient_info["patient_chief_complaint"]
    history_questions = create_history_questions(patient_info)
    physical_exam_questions = create_physical_exam_questions(patient_info)

    qa_human_prompt = f"""
    Chief_complaint:
    {chief_complaint}

    History_questions:
    {history_questions}

    Physical_examination_questions:
    {physical_exam_questions}"""

    response = simple_rag_chain.invoke({
        "input": qa_human_prompt,
    })

    print("1: patient's condition and suggest suspected diagnoses")
    print(response["answer"])

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
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain

# Function to get examination and red flags
def get_examination_and_red_flags(suspected_diagnoses):
    uploaded_file_path1 = "content/drive/MyDrive/240814_Llama_RAG/2_Neck_Pain.pdf"
    uploaded_file_path2 = "content/drive/MyDrive/240814_Llama_RAG/6_PTX.pdf"

    vectorstore1 = process_pdf(uploaded_file_path1, persist_directory1)
    vectorstore2 = process_pdf(uploaded_file_path2, persist_directory2)

    system_prompt1 = """You are a renowned rehabilitation medicine specialist. Your task is to evaluate the patient's condition and suggest further examinations.

    1. Check the patient's condition:
       a) Chief_complaint: <Chief_complaint>
       b) History_taking:
          <History_questions>
       c) Physical_examinations:
          <Physical_examination_questions>
       d) Suspected_diagnoses:
          <Suspected_diagnoses> and <evidence>

    2. Suggest further examinations based on symptoms and suspected diagnoses:
       Refer to the [Imaging and Other Diagnostic Tests] section in {context}.

    ## Response Format
    ⚑ Recommended Tests (provide at least 3 if applicable):
      1. [Test Name]
          - Purpose:
          - Expected Results:
      2. [Test Name]
          - Purpose:
          - Expected Results:
      3. [Test Name]
          - Purpose:
          - Expected Results:

    """

    system_prompt2 = """You are a renowned rehabilitation medicine specialist. Your task is to assess the patient's condition and provide appropriate recommendations. Follow these instructions precisely:

    1. Assessment Process

      a) Carefully review the <History_questions> and <Physical_examination_questions>.
      b) Check for the following red flags. Each of these MUST be considered a red flag if present:
          - Fever
          - Unexplained weight loss
          - History of cancer
          - History of violent trauma
          - History of steroid use
          - Osteoporosis
          - Age < 20 or Age ≥ 50 (THIS IS CRITICAL)
          - Failure to improve with treatment
          - History of alcohol or drug abuse
          - HIV
          - Lower extremity spasticity
          - Loss of bowel or bladder function

    2. Age Verification (MANDATORY)

      - Extract the patient's exact age from the provided information.
      - If the age is 50 or above, this MUST be flagged as a red flag, no exceptions.

    3. Red Flag Identification Process

      - For each piece of information in the patient's history and examination:
        - Compare it against the red flag list above
        - If it matches any item on the list, it MUST be marked as a red flag
      - Double-check the age. If it's 50 or above, ensure it's marked as a red flag

    4. Action Steps

      a) If ANY red flags are present (including age ≥ 50):
          - List ALL identified red flags
          - Recommend immediate hospital visit
      b) ONLY if NO red flags are present:
          - Refer to the {context} guide
          - Suggest rehabilitation exercises

    5. Final Check

      Before providing your answer, verify one last time:
      - Is the patient's age 50 or above? If yes, this MUST be listed as a red flag.
      - Have you checked for ALL red flags in the list?

    ## Response Format

    ⚑ Answer:
    [Start with whether red flags are present or not. If present, list ALL red flags and recommend hospital visit. If not, provide PTX guide recommendations.]

    ⚑ Evidence per Answer:
    [List all relevant information from the patient's history and examination, especially age.]

    """

    rag_chain1 = create_rag_chain(vectorstore1, os.getenv("UPSTAGE_API_KEY"), system_prompt1)
    rag_chain2 = create_rag_chain(vectorstore2, os.getenv("UPSTAGE_API_KEY"), system_prompt2)

    patient_info = load_patient_info() or get_user_input()
    save_patient_info(patient_info)

    chief_complaint = patient_info["patient_chief_complaint"]
    history_questions = create_history_questions(patient_info)
    physical_exam_questions = create_physical_exam_questions(patient_info)

    answer_part, evidence_part = suspected_diagnoses.split("⚑ Evidence per Answer:")
    diagnoses = [diagnosis.strip() for diagnosis in answer_part.split("\n") if diagnosis.strip()]
    evidence = [ev.strip() for ev in evidence_part.strip().split("\n") if ev.strip()]

    qa_human_prompt1 = f"""
    Chief_complaint:
    {chief_complaint}

    History_questions:
    {history_questions}

    Physical_examination_questions:
    {physical_exam_questions}

    Suspected_diagnoses:
    {diagnoses}

    Suspected_diagnoses evidence:
    {evidence}"""

    response1 = rag_chain1.invoke({"input": qa_human_prompt1})

    print("\n2: suggest further examinations")
    print(response1["answer"])

    qa_human_prompt2 = f"""
    History_questions:
    {history_questions}

    Physical_examination_questions:
    {physical_exam_questions}"""

    response2 = rag_chain2.invoke({"input": qa_human_prompt2})

    print("\n3: provide appropriate recommendations")
    print(response2["answer"])

    return response2["answer"]

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
    except pd.errors.EmptyDataError:
        return [0] * 17  # Return list of zeros if file is empty

    if df.empty or len(df) == 0:
        return [0] * 17  # Return list of zeros if DataFrame is empty

    if date is None:
        date = datetime.now()
    elif isinstance(date, str):
        date = datetime.strptime(date, "%Y-%m-%d")

    seven_days_ago = date - timedelta(days=7)

    df_recent = df[df['datetime'] > seven_days_ago]

    if df_recent.empty:
        return [0] * 17  # Return list of zeros if no data within 7 days

    averages = []
    for item in range(1, 18):
        column_name = f'Item {item}'
        avg = df_recent[column_name].mean()
        averages.append(round(avg, 2) if not pd.isna(avg) else 0)

    return averages

def input_item_scores(file_path):
    """
    Function to input scores for Items 1 to 17 from the user or load from existing file.

    :param file_path: Path to the CSV file
    :return: List containing 17 item scores
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
    """
    Compare current scores with 7-day averages and identify items with decreased scores.

    :param item_scores: List of current scores for items 1-17
    :param average_scores: List of 7-day average scores for items 1-17
    :return: List of tuples containing (item name, current score, average score) for decreased items
    """
    item_names = [
        "Reach fwd", "Reach Up", "Reach Down", "Lift Up", "Push Down",
        "Wrist Up", "Acquire - Release", "Grasp Dynamometer", "Lateral Pinch",
        "Pull Weight", "Push Weight", "Container", "Pinch Die", "Pencil",
        "Manipulate (chip)", "Push Index", "Push Thumb"
    ]

    decreased_items = []

    for i, (current, average) in enumerate(zip(item_scores, average_scores)):
        if current < average:
            decreased_items.append(item_names[i])

    return decreased_items

def get_patient_info(file_path, diagnosis_id):
    """
    Function to get patient information from user input or load from existing file.

    :param file_path: Path to the patient info file
    :param diagnosis_id: Diagnostic assessment ID
    :return: List containing patient information
    """
    if os.path.exists(file_path):
        with open(file_path, 'r') as file:
            patient_info = file.read().splitlines()
        print(f"Loaded patient information for {diagnosis_id} from existing file.")
        return patient_info

    print(f"No existing patient info found for {diagnosis_id}. Please input patient information.")
    diagnosed_patient = input('diagnosis: ')
    patient_disability = input("Patient's disability (write your main difficulty): ")
    functional_evaluation = "CUE-T"
    new_symptoms = input("Newly acquired symptoms: ")

    patient_info = [diagnosed_patient, patient_disability, functional_evaluation, new_symptoms]

    # Save the patient info to a file
    with open(file_path, 'w') as file:
        file.write('\n'.join(patient_info))

    return patient_info

# Set directories for vector stores
persist_directory1 = "content/drive/MyDrive/240814_Llama_RAG/chroma_db1"
persist_directory2 = "content/drive/MyDrive/240814_Llama_RAG/chroma_db2"
persist_directory3 = "content/drive/MyDrive/240814_Llama_RAG/chroma_db3"
persist_directory4 = "content/drive/MyDrive/240814_Llama_RAG/chroma_db4"
persist_directory5 = "content/drive/MyDrive/240814_Llama_RAG/chroma_db5"

def patient_scores():
    # Prompt the user to enter the diagnostic assessment ID
    diagnosis_id = input("Please enter the diagnostic assessment ID: ")
    scores_file_path = f'content/drive/MyDrive/240814_Llama_RAG/{diagnosis_id}.csv'

    # Check if the CSV file for the given diagnostic ID exists
    if os.path.exists(scores_file_path):
        print(f"Welcome, {diagnosis_id}")
    else:
        with open(scores_file_path, 'w', newline='') as file:
            writer = csv.writer(file)
            headers = ['datetime'] + [f'Item {i}' for i in range(1, 18)]
            writer.writerow(headers)
        print(f"{diagnosis_id}.csv file has been created.")

    # Generate today's date in YYYYMMDD format
    today_date = datetime.now().strftime("%Y%m%d")

    # Append today's date to the patient_info_file_path
    patient_info_file_path = f'content/drive/MyDrive/240814_Llama_RAG/{diagnosis_id}_{today_date}_info.txt'

    # Calculate 7-day average
    average_scores = calculate_7day_average(scores_file_path)
    print(f"7-day average scores calculated for {diagnosis_id}.")

    # Input current item scores or load from file
    current_scores = input_item_scores(scores_file_path)

    # Compare scores and identify decreased items
    decreased_items = compare_scores(current_scores, average_scores)
    print(f"\nItems with decreased scores for {diagnosis_id}:", decreased_items)

    # Get patient information or load from file
    patient_info = get_patient_info(patient_info_file_path, diagnosis_id)

    print(f"\nPatient Information for {diagnosis_id}:")
    print("diagnosis:", patient_info[0])
    print("Disability:", patient_info[1])
    print("Functional Evaluation:", patient_info[2])
    print("New Symptoms:", patient_info[3])

    return diagnosis_id, decreased_items, patient_info


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

def create_rag_chain(vectorstore, api_key, system_prompt):
    chat = ChatUpstage(upstage_api_key=api_key, temperature=0)

    retriever = vectorstore.as_retriever(k=2)

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    question_answer_chain = create_stuff_documents_chain(chat, qa_prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    return rag_chain

def get_rehabilitation_evaluation():
    uploaded_file_path2 = "content/drive/MyDrive/240814_Llama_RAG/6_PTX.pdf"
    uploaded_file_path3 = "content/drive/MyDrive/240814_Llama_RAG/4_CUE_T_Manual.pdf"
    uploaded_file_path4 = "content/drive/MyDrive/240814_Llama_RAG/7_Stroke_Complications.pdf"
    uploaded_file_path5 = "content/drive/MyDrive/240814_Llama_RAG/8_Spinal_Cord_Injury_Complications.pdf"

    vectorstore2 = process_pdf(uploaded_file_path2, persist_directory2)
    vectorstore3 = process_pdf(uploaded_file_path3, persist_directory3)
    vectorstore4 = process_pdf(uploaded_file_path4, persist_directory4)
    vectorstore5 = process_pdf(uploaded_file_path5, persist_directory5)

    system_prompt1 = """You are a renowned rehabilitation medicine specialist. Evaluate physical functions related to patient's diagnosis and disabilities. And suggest anatomical structures.

    1. Based on <Patient_disability>, suggest which <Functional_evaluation> is needed for the patient.

    2. Suggest anatomical structures used during each item in <ITEMs>.:
       Refer to the [INTENT] section in {context}.

    ## Response Format
    ⚑ Suggest <Functional_evaluation>:
      1. CUE T Test
          - Evidence: [Brief explanation of why this test is appropriate]
    ⚑ Extract anatomical structure:
      • [Specific muscle group name]: [specific muscles within that group]
          - Evidence: [1-2 sentences explaining the role of these muscles in the test]

    Note: Always use 'CUE T Test' as the functional evaluation. Provide concise, specific information for each section. Fill in all bracketed fields, including the specific muscle group name, with relevant content.
    """

    system_prompt2 = """You are a renowned rehabilitation medicine specialist. Your task is to analyze the exercise information provided in the {context} and suggest appropriate exercises based on the following:

    1. Review the "Client's aim" mentioned in the {context} to understand the target area for improvement.

    2. Analyze the exercise described in "Client's instructions" within the {context} and suggest modifications or additional exercises that:
      a) Target the same anatomical structures
      b) Help achieve the client's aim
      c) Provide variety and progression in the rehabilitation program

    3. Consider any anatomical structures mentioned in <ITEMs> and incorporate exercises that address these specific areas.

    ## Response Format
    ⚑  Item of which the score dropped:
    [Item of which the score dropped]

    ⚑ Suggested Exercises:
      1. Exercise Name:
        - Description:
        - Target muscles/structures:
        - How it supports the client's aim:

      2. Exercise Name:
        [Repeat format for each suggested exercise, (provide at least 3 if applicable)]

    ⚑ Recommended Sets and Repetitions:
    [Provide a range for sets and repetitions, considering the information given in the {context}]

    ⚑ Recommended Sessions per Week:
    [Suggest an appropriate frequency based on the information in the {context}]

    """

    system_prompt3 = """You are a renowned rehabilitation medicine specialist. Your task is to show list of extracted complications recommend hospital visit or not.

    1. Get <Newly_acquired_symptoms> and Show list of extracted complications to patient

    2. recommend hospital visit if <Newly_acquired_symptoms> indicate certain complications among complications extracted from {context}.

    ## Response Format

    ⚑ suspected complications
      - suspected complications:
      - Evidence:

    ⚑ Visit nearby hospital: [Yes / No]
      - Evidence:"""

    rag_chain1 = create_rag_chain(vectorstore3, os.getenv("UPSTAGE_API_KEY"), system_prompt1)
    rag_chain2 = create_rag_chain(vectorstore2, os.getenv("UPSTAGE_API_KEY"), system_prompt2)
    rag_chain3 = create_rag_chain(vectorstore4, os.getenv("UPSTAGE_API_KEY"), system_prompt3)
    rag_chain4 = create_rag_chain(vectorstore5, os.getenv("UPSTAGE_API_KEY"), system_prompt3)

    # Input or load patient information
    diagnosis_id, decreased_items, patient_info = patient_scores()

    diagnosed_patient = patient_info[0]
    patient_disability = patient_info[1]
    functional_evaluation = patient_info[2]
    ITEMs = decreased_items
    newly_acquired_symptoms = patient_info[3]


    qa_human_prompt1 = f"""
    Diagnosed_patient:
    {diagnosed_patient}

    Patient_disability:
    {patient_disability}

    ITEMs:
    {ITEMs}"""

    response1 = rag_chain1.invoke({"input": qa_human_prompt1})

    print("\n1: Suggest Functional_evaluation and Extract anatomical structures")
    print(response1["answer"])

    pattern = r'⚑ Extract anatomical structure:.*?(?=⚑|\Z)'
    match = re.search(pattern, response1["answer"], re.DOTALL)

    if match:
        extracted_text = match.group().strip()
        # print(extracted_text)

    qa_human_prompt2 = f"""
    Suggest_anatomical_structures:
    {extracted_text}

    ITEMs:
    {ITEMs}"""

    response2 = rag_chain2.invoke({"input": qa_human_prompt2})

    print("\n2: suggest exercises")
    print(response2["answer"])

    qa_human_prompt3 = f"""
      Newly_acquired_symptoms:
      {newly_acquired_symptoms}"""

    if diagnosed_patient == 'Stroke':

      response3 = rag_chain3.invoke({"input": qa_human_prompt3})

      print("\n3: extracted complications and recommend whether hospital visit")
      print(response3["answer"])

    elif diagnosed_patient == 'Spinal Cord Injury':
      response4 = rag_chain4.invoke({"input": qa_human_prompt3})

      print("\n3: extracted complications and recommend whether hospital visit")
      print(response4["answer"])

def check_diagnosis():
    has_diagnosis = input("Do you have a diagnostic assessment? (yes/no): ").lower()

    if has_diagnosis == "yes":
        get_rehabilitation_evaluation()
    elif has_diagnosis == "no":
        get_examination_and_red_flags(suspected_diagnoses)
    else:
        print("Invalid input. Please answer 'yes' or 'no'.")
        check_diagnosis()  # Recursively call the function to get correct input