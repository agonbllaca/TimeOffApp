import { Controller } from 'cx/ui';

import {store} from './../store';

export default class extends Controller {
    init() {
        super.init();
        this.getEmployeeData()
    }

    getEmployeeData(){
        //base url
        let url="http://localhost:3030/api/v1/users"
        let filters =[]
        if(store.get("$page.firstName"))
            filters.push(`firstName=${store.get("$page.firstName")}`)
        if(store.get("$page.lastName"))
            filters.push(`lastName=${store.get("$page.lastName")}`)
        if(store.get("$page.employeeType"))
            filters.push(`employeeType=${store.get("$page.employeeType")}`)
        if(store.get("$page.sickLeaveDays"))
            filters.push(`sickLeaveDays=${store.get("$page.sickLeaveDays")}`)
        if(store.get("$page.carryPtoDays"))
            filters.push(`carryPtoDays=${store.get("$page.carryPtoDays")}`)
        if(store.get("$page.ptoDays"))
            filters.push(`ptoDays=${store.get("$page.ptoDays")}`)

        //build the url   
        if(filters.length !=0){
            url+='?'+filters.join('&')
        }
        return fetch(url, {
        method: "GET"
    }).then(function(response) {
        return response.json().then((data)=>{
            let finalData = data.data.data
            store.set('$page.records',finalData)
        })
    }).catch(console.log('Error on testFetch'))}
}
