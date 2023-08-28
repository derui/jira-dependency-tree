use isahc::{http::StatusCode, Response};

/// make empty bad request
pub fn bad_request() -> Response<()> {
    Response::builder()
        .status(StatusCode::BAD_REQUEST)
        .body(())
        .unwrap()
}

/// make empty internal server error
pub fn internal_server_error() -> Response<()> {
    Response::builder()
        .status(StatusCode::INTERNAL_SERVER_ERROR)
        .body(())
        .unwrap()
}
