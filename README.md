# court-piece-p2p


## Signalling Server

### Setup Steps
- Create Virtual Envirnment
```
python3 -m venv env
```
- Activate Virtual Envirnment
```
source ./env/bin/activate
```
- Install dependencies
```
pip install -r requirements.txt
```
- Run Flask server
```
gunicorn --worker-class eventlet -w 1 server:app
```