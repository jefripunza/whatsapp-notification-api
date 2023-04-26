import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { URL } from "../../config";
import axios from "../../utils/axios";
import {
  createModal,
  createPopup,
  createDeleteQuestion,
} from "../../utils/sweetalert2";
import { getFocusVariable } from "../../helpers";

import Loading from "../../components/Loading";
import Layout from "../../components/Layout";
import Table from "../../components/Table";

const AddTemplate = () => {
  const [onProcess, setProcess] = useState(false);
  const [key, setKey] = useState("");
  const [sample, setSample] = useState("");
  const [examples, setExamples] = useState([]);
  const [example_data, setExampleData] = useState({});

  useEffect(() => {
    setExamples(getFocusVariable(sample));
    setExampleData(
      examples.reduce((simpan, key) => {
        simpan[key] = null;
        return simpan;
      }, {})
    );
  }, [sample]);

  return (
    <div className="template-col">
      <div className="template-form">
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
          placeholder="sample... ex: this is example #variable_name# in template and basic styling from original whatsapp something like *bold* _italic_ ~strikethrough~ ```monospace```"
          rows={10}
        />
        <br />
        {onProcess ? (
          <Loading type={"spin"} color={"#ccc"} size={30} />
        ) : (
          <button
            className="button button-success"
            onClick={async () => {
              if (!key) {
                toast.warning("key is require!");
                return;
              }
              if (examples.length == 0) {
                toast.warning("variable not found!");
                return;
              }
              const isNotFind = examples.filter((key) => !example_data[key]);
              if (isNotFind.length > 0) {
                toast.warning(
                  <>
                    example value from <b>{isNotFind.join(",")}</b> is require!
                  </>
                );
                return;
              }
              try {
                setProcess(true);
                const result = await axios({
                  url: URL + "/api/whatsapp/template",
                  method: "POST",
                  data: {
                    key,
                    sample,
                    example: JSON.stringify(example_data),
                  },
                }).then((req) => req.data);
                createPopup("success", result.message);
              } catch (error) {
                setProcess(false);
                toast.error(error.response.data.message);
              }
            }}
          >
            Submit!
          </button>
        )}
      </div>
      <div>
        {examples.length > 0 ? (
          <>
            <h4>Example value (require)...</h4>
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
                    placeholder={`${variable_name}...`}
                    value={example_data[variable_name]}
                    onChange={(e) => {
                      const now_value = example_data;
                      now_value[variable_name] = e.target.value;
                      setExampleData(now_value);
                    }}
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
          // {
          //   name: "Example",
          //   key: "example",
          // },
          {
            name: "Create At",
            key: "created_at",
          },
        ]}
        addButton={(refreshData) => {
          createModal({
            title: "Add Template",
            html: <AddTemplate />,
            onClose: refreshData,
          });
        }}
        addButtonText={"Add Template"}
        // actionDetail={(row) => {
        //   // console.log("detail", { row });
        // }}
        actionUpdate={(row) => {
          // console.log("update", { row });
        }}
        actionDelete={(row, refreshData) => {
          createDeleteQuestion(row.key, async () => {
            try {
              await axios({
                url: URL + `/api/whatsapp/template/${row.key}`,
                method: "DELETE",
              }).then((req) => req.data);
              refreshData();
              createPopup(
                "success",
                <>
                  <b>{row.key}</b> has been deleted.
                </>
              );
            } catch (error) {
              console.log({ error });
              toast.error(error.response.data.message);
            }
          });
        }}
      />
    </Layout>
  );
};

export default Templates;
