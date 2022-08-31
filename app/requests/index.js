import { LinkButton, TextField, NumberField,  Button, Grid } from 'cx/widgets';

import {Glyph} from './../components/Glyph';
import Controller from './Controller';

export default <cx>
<main class="csb-orderlist" controller={Controller}>
    <Grid
        records:bind="$page.records"
        style={{ width: "100%" }}
        mod="bordered"
        lockColumnWidths
        columns={[{
                    field: "firstName",
                    sortable: true,
                    header: {
                      items: (
                        <TextField
                        label = "First Name"
                          value:bind="$page.firstName"
                          style="width:100%"
                        />
                      )
                    }
                  },
                  {
                    field: "lastName",
                    sortable: true,
                    header: {
                      items: (
                        <TextField
                        label = "Last Name"
                          value:bind="$page.lastName"
                          style="width:100%"
                        />
                      )
                    }
                  },
                  {
                      
                     field: "employeeType",
                     sortable: true,
                      header: {
                      items: (
                          <TextField
                          label="Employee Type"
                          value:bind="$page.employeeType"
                          style="width:100%"/>
                     )
                    },
                    
                  },
                  {
                        field: 'sickLeaveDays', sortable: true,
                        header: {
                            items: (
                            <NumberField 
                            label="Sick Leave Days" 
                            value-bind="$page.sickLeaveDays" 
                            format="n;0" 
                            style="width:100%"/>
                                )
                        }
                  },
                  {
                       field: 'carryPtoDays', sortable: true,
                       header: {
                           items: (
                           <NumberField 
                           label="Carry Pto Days" 
                           value-bind="$page.carryPtoDays" 
                           format="n;0" 
                           style="width:100%"/>
                           )
                        }
                    },
                    {
                        field: 'ptoDays', sortable: true,
                        header: {
                            items: (
                            <NumberField 
                            label="Pto Days" 
                            value-bind="$page.ptoDays" 
                            format="n;0" 
                            style="width:100%"/>
                            )
                        }
                    },
                    {
                        field: '_id', sortable: true,
                        header: {
                            items: <cx>
                                    Report
                                    <br/> 
                                    <Button mod="primary" onClick={(e, { controller }) => {
                                                controller.getEmployeeData();
                                    }}>Search</Button>
                                    <Button onClick={(e, {controller, store}) => {
                                            store.delete('$page.firstName')
                                            store.delete('$page.lastName')
                                            store.delete('$page.employeeType')
                                            store.delete('$page.sickLeaveDays')
                                            store.delete('$page.carryPtoDays')
                                            store.delete('$page.ptoDays')
                                        controller.getEmployeeData();
                                    }}>Clear</Button>  
                            </cx>
                        },
                        items: <cx>
                        <LinkButton  mod="primary" href:tpl="http://localhost:3030/api/v1/timeRequests/report/{$record._id}"> 
                            Report <Glyph  name="download"/>
                        </LinkButton>
                        </cx>,
                    }
                ]}
              />
        </main>
    </cx>;

