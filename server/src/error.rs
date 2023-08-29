use isahc::{http::StatusCode, Response};
use lambda_http::Body;

/// make empty bad request
pub fn bad_request() -> Response<Body> {
    Response::builder()
        .status(StatusCode::BAD_REQUEST)
        .body(Body::Empty)
        .unwrap()
}

/// make empty internal server error
pub fn internal_server_error() -> Response<Body> {
    Response::builder()
        .status(StatusCode::INTERNAL_SERVER_ERROR)
        .body(Body::Empty)
        .unwrap()
}
