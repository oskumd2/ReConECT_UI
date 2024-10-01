# ReConECT_UI
UI for ReConECT<br />
Web design by @yunnii-c <br />
Web development by @oskumd2

## How to develop the app in your local environment

`Dowload db_data, rag_data folder on your root directory: folder available on Google Drive`<br /> (https://drive.google.com/drive/folders/1Fl1vmiF3LYT4yNfc8pgcdeCtSNPx08zO?usp=drive_link)


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
(add newly created heroku app link to const herokulink in Chatbot_v2.py) <br />
npm run build<br />
copy all files in ./chatbot-ui/build/ to oskumd2.github.io repository (or own own Github pages repository) 
