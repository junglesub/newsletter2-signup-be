# 베이스 이미지 설정
FROM node:18-alpine

# 앱 디렉토리 생성
WORKDIR /usr/src/app

# 앱 의존성 복사 및 설치
COPY package*.json ./

RUN npm install

# 앱 소스 코드 복사
COPY . .

# 앱이 실행될 포트 설정
EXPOSE 3000

# 앱 실행 명령어
CMD [ "node", "./bin/www" ]
