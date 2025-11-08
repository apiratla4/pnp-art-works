FROM openjdk:26-ea-jdk-slim
LABEL version="1.0"
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
