import React, { Component } from 'react';
import { Fieldset } from 'primereact/fieldset';

export class Fieldsets extends Component {

    render() {
        return (
                <div>
                    <h4>Available Static Analysis Tools:</h4>
                    <Fieldset legend="Cargo Audit" toggleable>
                        <p class ="two">Cargo Audit analyzes Cargo.lock files for crates with security vulnerabilities. Cargo Audit compares the lock files against the RustSec Advisory Database, a community database of security vulnerabilities maintained by the Rust Secure Code Working Group. Cargo Audit is the most popular tool for inspecting Rust crates.
                            <br></br>                            
                            <a href="https://github.com/rustsec/rustsec">Link to the GitHub Documentationn</a>
                        </p>
                    </Fieldset>
                    <Fieldset legend="Clippy" toggleable>
                        <p class ="two">Clippy is a collection of lints to catch common mistakes and improve your Rust code. Clippy is the most popular tool to detect any errors in the code. Clippy sorts its errors in 7 different error categories including correctness, suspicious, style, complexity, perf, pedantic, nursery, and cargo.
                            <br></br>
                            <a href="https://github.com/rust-lang/rust-clippy">Link to the GitHub Documentation</a>
                        </p>
                    </Fieldset>
                    <Fieldset legend="Mirai" toggleable>
                        <p class ="two">MIRAI is an abstract interpreter for the Rust compiler's mid-level intermediate representation. Mirai focuses on programs that terminate unexpectedly and abruptly. A tool such as MIRAI goes beyond linters, patterns and practices; moving ever closer towards verifying that code cannot terminate abruptly.
                            <br></br>
                            <a href="https://github.com/facebookexperimental/MIRAI">Link to the GitHub Documentation</a>
                        </p>
                    </Fieldset>
                </div>
           
        )
    }
}

export default Fieldsets;