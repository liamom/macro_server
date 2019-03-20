#![deny(warnings)]
use futures::{future, Future};

use hyper::{Body, Method, Request, Response, Server, StatusCode};
use hyper::service::service_fn;

use std::marker::Sync;
//use std::marker::Send;
use std::sync::RwLock;

use tokio_fs;
use std::io;

use inputbot::{*};
use crate::macro_data::*;


static NOTFOUND: &[u8] = b"Not Found";
static INDEX: &str = "examples/send_file_index.html";

type ResponseFuture = Box<Future<Item=Response<Body>, Error=io::Error> + Send>;

pub struct Api {
    state: RwLock<Grid>,
}


impl Api {
    pub fn new() -> Self{
        Api {state: RwLock::from(Grid::new()) }
    }

    fn get_grid(&self) -> ResponseFuture {
        let save= self.state.read().unwrap();
        let result = serde_json::to_string(&*save);
        let response = match result {
            Ok(serial) => {
                Response::builder()
                    .body(serial.into())
            },
            Err(e) => {
                Response::builder()
                    .status(StatusCode::INTERNAL_SERVER_ERROR)
                    .body(e.to_string().into())
            },
        };

        Box::new(future::ok(response.unwrap()))
    }

    pub fn service(&self, req: Request<Body>) -> ResponseFuture {
        match (req.method(), req.uri().path()) {
            (&Method::GET, "/") => {
                let output= "";

                Box::new(future::ok(Response::builder()
                    .body(output.into())
                    .unwrap()
                ))
            },
            (&Method::GET, "/api/grid") => {self.get_grid()}
            (&Method::GET, "/index.html") | (&Method::GET, "/big_file.html") => {
                simple_file_send(INDEX)
            },
            (&Method::GET, "/no_file.html") => {
                // Test what happens when file cannot be be found
                simple_file_send("this_file_should_not_exist.html")
            },
            _ => {
                Box::new(future::ok(Response::builder()
                    .status(StatusCode::INTERNAL_SERVER_ERROR)
                    .body(Body::empty())
                    .unwrap()))
            }
        }
    }
}


fn main2() {
    let addr = "127.0.0.1:1337".parse().unwrap();

    let server = Server::bind(&addr)
        .serve(|| service_fn(response_examples))
        .map_err(|e| eprintln!("server error: {}", e));

    println!("Listening on http://{}", addr);

    hyper::rt::run(server);
}


fn response_examples(req: Request<Body>) -> ResponseFuture {
    match (req.method(), req.uri().path()) {
        (&Method::GET, "/") => {
            Box::new(future::ok(Response::builder()
                .body("badf".into())
                .unwrap()
            ))
        },
        (&Method::GET, "/index.html") | (&Method::GET, "/big_file.html") => {
            simple_file_send(INDEX)
        },
        (&Method::GET, "/no_file.html") => {
            // Test what happens when file cannot be be found
            simple_file_send("this_file_should_not_exist.html")
        },
        _ => {
            Box::new(future::ok(Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Body::empty())
                .unwrap()))
        }
    }

}

fn simple_file_send(f: &str) -> ResponseFuture {
    // Serve a file by asynchronously reading it entirely into memory.
    // Uses tokio_fs to open file asynchronously, then tokio_io to read into
    // memory asynchronously.
    let filename = f.to_string(); // we need to copy for lifetime issues
    Box::new(tokio_fs::file::File::open(filename)
        .and_then(|file| {
            let buf: Vec<u8> = Vec::new();
            tokio_io::io::read_to_end(file, buf)
                .and_then(|item| {
                    Ok(Response::new(item.1.into()))
                })
                .or_else(|_| {
                    Ok(Response::builder()
                        .status(StatusCode::INTERNAL_SERVER_ERROR)
                        .body(Body::empty())
                        .unwrap())
                })
        })
        .or_else(|_| {
            Ok(Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(NOTFOUND.into())
                .unwrap())
        }))
}