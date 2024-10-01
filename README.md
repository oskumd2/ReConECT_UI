# ReConECT_UI
UI for ReConECT: This repository shows methods to make chatbot UI based on Upstage APIs, Flask backend and React frontend. <br />
3rd Prize winning project in [2024 Upstage Hackathon](https://m.economidaily.com/view/20240930081039778). <br />
contact oskumd00@gmail.com if you have any questions or request for RAG database (db_data, rag_data, diagnosis_json_data folder). <br /><br />
Model development by [@SeungHoJUN](https://github.com/SeungHoJUN) <br />
Web design and Domain knowledge application by [@yunnii-c](https://www.github.com/yunnii-c) (M.D.) <br />
Web development and Domain knowledge application by [@oskumd2](https://www.github.com/oskumd2) (M.D.)<br /><br />

## How to develop the app in your local environment

`Dowload db_data, rag_data, diagnosis_json_data folder on your root directory`<br />


`Manually set virtual environment in folder venv by running the following code in your terminal:`<br />
Mac: python3 -m venv venv<br />
Windows: python -m venv venv<br /><br />

`Activate virtual environment in your terminal (may have to change Setting in Powershell to execute):`<br />
Mac: source venv/bin/activate<br />
Windows: .\venv\Scripts\activate<br /><br />

`Install requirements by running pip install -r requirements.txt on your terminal.`<br /><br />
`Create "chatbot-ui" directory to manage React frontend`<br />
`npx create-react-app chatbot-ui`<br /><br />

migrate /src folder under ./chatbot-ui/src/ and put package.json under ./chatbot-ui<br />
Add app.py backend file, ReConECT_v2.py, .nev, Procfile under root directory<br /><br />

## How to deploy on server
`under virtual environment run following code:`<br /><br />
[backend terminal] <br />
heroku login<br />
git init<br />
git add .env app_v2.py Procfile Re_ConECT_v2.py requirements.txt db_data rag_data<br />
git commit -m 'ReConECT'<br />
heroku git:remote -a reconect<br />
heroku buildpacks:set heroku/python<br />
git push heroku master<br /><br />

[frontend terminal] <br />
(exit from venv) cd chatbot-ui<br />
(add newly created heroku app link to constant variable 'herokulink' in Chatbot_v2.py) <br />
npm run build<br />
copy all files in ./chatbot-ui/build/ to oskumd2.github.io repository (or own own Github pages repository)
