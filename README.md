# ReConECT_UI
UI for ReConECT

## How to develop the app in your local environment

Dowload db_data, rag_data folder on your root directory: folder available on Google Drive (https://drive.google.com/drive/folders/1Fl1vmiF3LYT4yNfc8pgcdeCtSNPx08zO?usp=drive_link)

Manually set virtual environment in folder venv by running the following code in your terminal:

Mac: python3 -m venv venv

Windows: python -m venv venv

Activate virtual environment in your terminal (may have to change Setting in Powershell to execute):

Mac: source venv/bin/activate

Windows: .\venv\Scripts\activate

Install requirements by running pip install -r requirements.txt on your terminal.


Creat "chatbot-ui" directory to manage React frontend

npx create-react-app chatbot-ui


migrate /src folder under ./chatbot-ui/src/ and put package.json under ./chatbot-ui

Add app.py backend file, ReConECT_v2.py, .nev, Procfile under root directory

## How to deploy on server

under virtual environment run following code:


heroku login

git init

git add .env app_v2.py Procfile Re_ConECT_v2.py requirements.txt db_data rag_data

git commit -m 'ReConECT'

heroku git:remote -a reconect

heroku buildpacks:set heroku/python

git push heroku master

(exit from venv) cd chatbot-ui

npm run build


