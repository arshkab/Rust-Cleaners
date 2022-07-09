FROM ubuntu:18.04
MAINTAINER kipp
# Update
RUN apt-get update
# Install node.js v14
RUN apt-get -y install curl && curl -sL https://deb.nodesource.com/setup_14.x | bash && apt-get -y install nodejs
# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
# Install Git
RUN apt-get update && apt-get -y install git
# Install clippy
RUN apt-get update && apt-get -y install build-essential
RUN rustup update && rustup component add clippy
RUN cargo install clippy-sarif
# Install cargo-audit
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get -y install pkg-config
RUN apt-get update && apt-get install libssl-dev
RUN cargo install cargo-audit


# NODE
COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 8080

RUN npm run build

CMD [ "npm", "start" ]