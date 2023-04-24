import React, { useEffect, useState } from "react";

import Layout from "../../components/Layout";
import Table from "../../components/Table";

import { createModal } from "../../utils/sweetalert2";
import axios from "axios";
import { URL } from "../../config";
import { getFocusVariable } from "../../helpers";

const AddTemplate = () => {
  const [key, setKey] = useState("");
  const [sample, setSample] = useState("");
  const [examples, setExamples] = useState([]);

  useEffect(() => {
    setExamples(getFocusVariable(sample));
  }, [sample]);

  return (
    <div className="template-col">
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <input
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="key..."
          />
          <br />
          <textarea
            value={sample}
            onChange={(e) => setSample(e.target.value)}
            placeholder="sample... ex: this is example #variable_name# in template"
            rows={6}
          />
          <br />
          <button type="submit" className="button button-success">
            Submit!
          </button>
        </form>
      </div>
      <div>
        {examples.length > 0 ? (
          <>
            {examples.map((variable_name, i) => {
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                  }}
                >
                  <input
                    type="text"
                    placeholder={`value ${variable_name}...`}
                  />
                </div>
              );
            })}
          </>
        ) : (
          <>Variable not found...</>
        )}
      </div>
    </div>
  );
};

const Templates = () => {
  return (
    <Layout>
      <h1>Templates</h1>
      <Table
        title={"Template Message"}
        url={"/api/whatsapp/template"}
        columns={[
          {
            name: "Key",
            key: "key",
          },
          {
            name: "Example",
            key: "example",
          },
          {
            name: "Create At",
            key: "created_at",
          },
        ]}
        addButton={() => {
          createModal({
            title: "Add Template",
            html: <AddTemplate />,
            preConfirm: async () => {
              try {
                await axios({
                  url: URL + "/api/whatsapp/template",
                  method: "POST",
                }).then((req) => req.data);
                return {
                  icon: "success",
                  message: "Success Add Template!",
                };
              } catch (error) {
                return {
                  icon: "error",
                  message: `Request failed: ${error.message}`,
                };
              }
            },
          });
        }}
        addButtonText={"Add Template"}
        // actionDetail={(row) => {
        //   // console.log("detail", { row });
        // }}
        actionUpdate={(row) => {
          // console.log("update", { row });
        }}
        actionDelete={(row) => {
          // console.log("delete", { row });
        }}
      />
    </Layout>
  );
};

export default Templates;
