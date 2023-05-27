FROM public.ecr.aws/lambda/provided:al2 as builder

# リンカーとしてgccを利用する
RUN yum install -y gcc pkgconfig openssl-devel

# rustupでRustツールチェーンをインストールする
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain stable
ENV PATH $PATH:/root/.cargo/bin
RUN rustup install stable

# ビルド対象のソースツリーをマウントする
COPY . /code

# ローカル環境にRustを導入している場合は以下をコメントアウトするとビルドが早くなります
#VOLUME /root/.cargo/registry
#VOLUME /root/.cargo/git

WORKDIR /code
# provided:al2 はランタイム用の設定になっているので、ENTRYPOINTをビルド用に書き換える

#RUN ["cargo", "build", "--release"]
RUN ["cargo", "build"]

FROM public.ecr.aws/lambda/provided:al2

# 実行ファイルを起動するようにするため、ファイル名を "bootstrap" に変更する
#COPY --from=builder /code/target/release/jira-issue-loader ${LAMBDA_RUNTIME_DIR}/bootstrap
COPY --from=builder /code/target/debug/jira-issue-loader ${LAMBDA_RUNTIME_DIR}/bootstrap

# カスタムランタイム同様ハンドラ名は利用しないため、適当な文字列を指定する。
CMD [ "lambda-handler" ]
