FROM httpd:2.4
ADD https://github.com/Terf/bootstrap/archive/communityhub.tar.gz /usr/local/css/bootstrap.tar.gz
WORKDIR /usr/local/apache2/htdocs/
COPY . .
RUN tar xvfz /usr/local/css/bootstrap.tar.gz && mv ./bootstrap-communityhub/dist/css/bootstrap.min.css ./css/bootstrap.css
