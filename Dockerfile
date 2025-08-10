FROM nginx:latest

# Ensure the target directory exists
RUN mkdir -p /usr/share/nginx/html/static

COPY nginx.conf /etc/nginx/nginx.conf
COPY index.html /usr/share/nginx/html/static/
COPY script.js  /usr/share/nginx/html/static/
COPY style.css  /usr/share/nginx/html/static/
COPY quests.json /usr/share/nginx/html/static/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]