#![allow(dead_code)]
#![allow(unused_imports)]

use hyper::{Client, Server};
use hyper::service::service_fn;
use futures::{future, Future};
use crate::macro_server::Api;
use std::rc::Rc;
use std::sync::Arc;
use inputbot::KeySequence;

mod macro_server;
mod macro_data;

fn main() {
    let addr = "127.0.0.1:5000".parse().unwrap();

    hyper::rt::run(future::lazy(move || {
        // Share a `Client` with all `Service`s
        let _client = Client::new();
        let api = Arc::new(Api::new());

        let service = move || {
            let api_rc = api.clone();
            service_fn(move |req| {
                api_rc.service(req)
            })
        };

        let server = Server::bind(&addr)
//            .serve(new_service)
            .serve(service)
            .map_err(|e| eprintln!("server error: {}", e));

        println!("Listening on http://{}", addr);

        server
    }));}