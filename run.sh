trap "exit" INT TERM ERR
trap "kill 0" EXIT

uvicorn myapp.main:app --host 0.0.0.0 --port 8080 --workers 1 --reload --proxy-headers --forwarded-allow-ips='*' &
npm start --prefix myapp-frontend &

wait
