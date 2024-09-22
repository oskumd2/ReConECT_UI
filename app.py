from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Ensure CORS is enabled

from Re_ConECT import suspected_diagnoses, get_examination_and_red_flags, load_patient_info, calculate_7day_average, compare_scores, get_rehabilitation_evaluation

@app.route('/check_diagnosis', methods=['POST'])
def check_diagnosis():
    try:
        data = request.json
        print("Received /check_diagnosis request with data:", data)
        has_diagnosis = data.get('has_diagnosis', '').lower()
        if has_diagnosis == "yes":
            result = "get_rehabilitation_evaluation"
            return jsonify({"result": result})
        elif has_diagnosis == "no":
            has_existing_info = load_patient_info()
            return jsonify({"hasExistingInfo": has_existing_info})
        else:
            return jsonify({"error": "Invalid input. Please answer 'yes' or 'no'."}), 400
    except Exception as e:
        print("Error in /check_diagnosis:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/user_input', methods=['POST'])
def user_input():
    try:
        data = request.json
        print("Received /user_input request with data:", data)
        patient_info = data.get('patient_info', {})
        result = suspected_diagnoses(patient_info)
        examination_result = get_examination_and_red_flags(result)
        return jsonify({"diagnosis": result, "examination": examination_result})
    except Exception as e:
        print("Error in /user_input:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/use_existing_info', methods=['POST'])
def use_existing_info():
    try:
        patient_info = load_patient_info()
        result = suspected_diagnoses(patient_info)
        examination_result = get_examination_and_red_flags(result)
        return jsonify({"diagnosis": result, "examination": examination_result})
    except Exception as e:
        print("Error in /use_existing_info:", str(e))
        return jsonify({"error": str(e)}), 500

################
import os, csv
import pandas as pd
from datetime import datetime
@app.route('/Check_diagnosis_id', methods=['POST'])
def check_diagnosis_id():
    try:
        data = request.json
        print("Received /Check_diagnosis_id:", data)
        diagnosis_id = data.get('diagnosis_id', {})

        scores_file_path = f'content/drive/MyDrive/240814_Llama_RAG/{diagnosis_id}.csv'

        if os.path.exists(scores_file_path):
            result = "Welcome, " +diagnosis_id
        else:
            with open(scores_file_path, 'w', newline='') as file:
                writer = csv.writer(file)
                headers = ['datetime'] + [f'Item {i}' for i in range(1, 18)]
                writer.writerow(headers)
            result = diagnosis_id+".csv file has been created."      


        file_path = f'content/drive/MyDrive/240814_Llama_RAG/{diagnosis_id}.csv'
        today = datetime.now().strftime("%m/%d/%Y")  # Format: M/D/YYYY
        if os.path.exists(file_path):
            df = pd.read_csv(file_path, parse_dates=['datetime'])
            df['datetime'] = pd.to_datetime(df['datetime'])
            today_data = df[df['datetime'].dt.strftime("%m/%d/%Y") == today]
            if not today_data.empty:
                result2= "\n Loaded today's scores ("+today+") from existing file. Press any key to Proceed."
                existing_file = True
            else:
                result2 = "\n No scores found for today ("+today+"). From now on, you will input current scores for each item. Press any key to Proceed."
                existing_file = False
        else:
            result2 = "\n No existing file found. From now on, you will input current scores for each item. Press any key to Proceed."
            existing_file = False
        return jsonify({"result": result+result2, "diagnosis_id": diagnosis_id, "existing_file": existing_file})
    except Exception as e:
        print("Error in /Check_diagnosis_id:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/File_exists', methods=['POST'])
def file_exists():
    try:
        data = request.json
        print("Received /File_exists:", data)
        diagnosis_id = data.get('diagnosis_id', {})

        file_path = f'content/drive/MyDrive/240814_Llama_RAG/{diagnosis_id}.csv'
        today = datetime.now().strftime("%m/%d/%Y")  # Format: M/D/YYYY
        if os.path.exists(file_path):
            df = pd.read_csv(file_path, parse_dates=['datetime'])
            df['datetime'] = pd.to_datetime(df['datetime'])
            today_data = df[df['datetime'].dt.strftime("%m/%d/%Y") == today]

            latest_scores = [int(score) for score in today_data.iloc[-1, 1:].tolist()]

        return jsonify({"scores": latest_scores})
    except Exception as e:
        print("Error in /Check_diagnosis_id:", str(e))
        return jsonify({"error": str(e)}), 500
    
@app.route('/Input_item_scores', methods=['POST'])
def input_item_scores():
    try:
        data = request.json
        print("Received /Check_diagnosis_id:", data)
        
        scores = data.get('scores', {})
        diagnosis_id = data.get('diagnosis_id', {})

        file_path = f'content/drive/MyDrive/240814_Llama_RAG/{diagnosis_id}.csv'
        today = datetime.now().strftime("%m/%d/%Y")  # Format: M/D/YYYY

        new_row = [today] + scores
        new_df = pd.DataFrame([new_row], columns=['datetime'] + [f'Item {i}' for i in range(1, 18)])

        if os.path.exists(file_path):
            existing_df = pd.read_csv(file_path)
            updated_df = pd.concat([existing_df, new_df], ignore_index=True)
            updated_df.to_csv(file_path, index=False, date_format='m/%d/%Y')
        else:
            new_df.to_csv(file_path, index=False, date_format='%m/%d/%Y')

        result = "Saved today's scores ("+today+") to file."

        # Generate today's date in YYYYMMDD format
        today_date = datetime.now().strftime("%Y%m%d")
        # Append today's date to the patient_info_file_path
        patient_info_file_path = f'content/drive/MyDrive/240814_Llama_RAG/{diagnosis_id}_{today_date}_info.txt'
        # Calculate 7-day average
        average_scores = calculate_7day_average(file_path)
        # Compare scores and identify decreased items
        decreased_items = compare_scores(scores, average_scores)
        
        result2 = "\nItems with decreased scores for "+diagnosis_id+": "+str(decreased_items)       

        return jsonify({"result": result+result2+"Press any key to get patient info.", "decreased_items": decreased_items})
    except Exception as e:
        print("Error in /use_existing_info:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/Get_patient_info', methods=['POST'])
def get_patient_info():
    try:
        data = request.json
        print("Received /Check_diagnosis_id:", data)
        diagnosis_id = data.get('diagnosis_id', {})
        today_date = datetime.now().strftime("%Y%m%d")
        file_path = f'content/drive/MyDrive/240814_Llama_RAG/{diagnosis_id}_{today_date}_info.txt'

        if os.path.exists(file_path):
            with open(file_path, 'r') as file:
                patient_info = file.read().splitlines()
                result = "Loaded patient information for "+ diagnosis_id+" from existing file."
        else:
            patient_info = []
            result = "No existing patient info found for "+diagnosis_id+". Please input patient information."
            # Save the patient info to a file
            with open(file_path, 'w') as file:
                file.write('\n'.join(patient_info))

        return jsonify({"result": result+ "Press any key to proceed.", "patient_info": patient_info})

    except Exception as e:
        print("Error in /use_existing_info:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/Get_rehabilitation_evaluation', methods=['POST'])
def get_rehabilitation_eval():
    try:
        data = request.json
        print("Received /Get_rehabilitation_evaluation:", data)
        decreased_items = data.get('decreased_items', {})
        patient_info = data.get('patient_info', {})
        result = get_rehabilitation_evaluation(decreased_items, patient_info)
        return jsonify({"result": result})
    except Exception as e:
        print("Error in /use_existing_info:", str(e))
        return jsonify({"error": str(e)}), 500    

@app.route('/Update_patient_info', methods=['POST'])
def update_patient_info():
    try:
        data = request.json
        print("Received /Update_patient_info:", data)
        patient_info = data.get('patient_info', {})
        diagnosis_id = data.get('diagnosis_id', {})
        today_date = datetime.now().strftime("%Y%m%d")
        file_path = f'content/drive/MyDrive/240814_Llama_RAG/{diagnosis_id}_{today_date}_info.txt'
        # Save the patient info to a file
        with open(file_path, 'w') as file:
            file.write('\n'.join(patient_info))    
        result= "Completed"
        return jsonify({"result": result})

    except Exception as e:
        print("Error in /use_existing_info:", str(e))
        return jsonify({"error": str(e)}), 500    
        
if __name__ == '__main__':
    app.run(debug=True, port=5011)  # Changed port to 5011 and enabled debug mode