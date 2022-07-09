import React, { Component } from 'react';
import { Checkbox } from 'primereact/checkbox';
import './body.css';


export class ToolCheckbox extends Component {

    constructor(props) {
        super(props);

        this.categories = [{ name: 'Cargo Audit', key: 'CA' }, { name: 'Clippy', key: 'C' }, { name: 'Soteria', key: 'R' }, { name: 'Mirai', key: 'M' }];

        this.state = {
            checked: false,
            cities: [],
            selectedCategories: this.categories.slice(0, 0)
        };


        this.onCategoryChange = this.onCategoryChange.bind(this);
    }

    onCategoryChange(e) {
        let selectedCategories = [...this.state.selectedCategories];

        if (e.checked) {
            selectedCategories.push(e.value);
        }
        else {
            for (let i = 0; i < selectedCategories.length; i++) {
                const selectedCategory = selectedCategories[i];

                if (selectedCategory.key === e.value.key) {
                    selectedCategories.splice(i, 1);
                    break;
                }
            }
        }
        this.setState({ selectedCategories });



    }



    render() {
        return (
            <div>
                <div className="card">
                    <main style={{ display: 'inline-block', paddingTop: '4rem', zIndex: 10, paddingBottom: '1rem' }}>
                        <h3>Software Analysis Tools:</h3>
                        {
                            this.categories.map((category) => {
                                return (
                                    <div key={category.key} className="field-checkbox">
                                        <Checkbox inputId={category.key} name="category" value={category} onChange={this.onCategoryChange} checked={this.state.selectedCategories.some((item) => item.key === category.key)} disabled={category.key === 'R' || category.key === 'S'} />
                                        <label htmlFor={category.key}>{category.name}</label>
                                    </div>
                                )
                            })
                        }
                    </main>
                </div>
            </div>
        )
    }
}
export default ToolCheckbox;