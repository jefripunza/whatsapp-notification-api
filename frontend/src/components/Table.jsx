import axios from "axios";
import React, { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import { URL } from "../config";

const Table = ({
  url,
  title,
  columns,
  shows,
  range_paging,
  addButton,
  addButtonText,
  actionDetail,
  actionUpdate,
  actionDelete,
}) => {
  const [onProcess, setOnProcess] = useState(false);

  const [list_show, _] = useState(shows ?? [10, 25, 50, 100]);

  const [data, setData] = useState([]);
  const [show, setShow] = useState(list_show[0]);
  const [paging, setPaging] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    setOnProcess(true);
    getData();
  }, []);

  const getData = async () => {
    if (!onProcess) return;
    try {
      const result = await axios({
        url: `${URL}${url}`,
        params: {
          page: paging,
          show,
        },
      });
      const { data, total_page } = result.data;
      console.log("pagination:", {
        url: result.request.responseURL,
        response_data: data,
      });
      setData(data);
      setLastPage(total_page);
    } catch (error) {
      console.log({ error });
    } finally {
      setOnProcess(false);
    }
  };
  useEffect(() => {
    getData();
  }, [onProcess]);

  const keys = columns.map((v) => v.key);
  range_paging = range_paging ?? 2;
  return (
    <div className="table-custom">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>{title}</h2>
        {addButton ? (
          <div
            style={{
              background: "transparent",
              border: "2px dashed var(--color-primary)",
              color: "var(--color-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingRight: 8,
              cursor: "pointer",
            }}
            onClick={() => {
              addButton(() => {
                setOnProcess(true);
                getData();
              });
            }}
          >
            <span className="material-icons-sharp">add</span>
            <h3>{addButtonText ?? "Add Item"}</h3>
          </div>
        ) : null}
      </div>
      <table>
        <thead>
          <tr>
            {columns.map((column, i_column) => (
              <th key={i_column}>{column.name}</th>
            ))}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((data, i_data) => {
            return (
              <tr key={i_data}>
                {keys.map((key, i_key) => {
                  const column_select = columns.find((v) => v.key == key);
                  const data_style = column_select?.dataStyle;
                  if (data_style) {
                    return <td key={i_key}>{data_style(data[key])}</td>;
                  }
                  return <td key={i_key}>{data[key]}</td>;
                })}
                <td>
                  {actionDetail ? (
                    <span
                      className="primary material-icons-sharp"
                      style={{ margin: 5, cursor: "pointer" }}
                      onClick={() => actionDetail(data)}
                    >
                      info
                    </span>
                  ) : null}
                  {actionUpdate ? (
                    <span
                      className="warning material-icons-sharp"
                      style={{ margin: 5, cursor: "pointer" }}
                      onClick={() =>
                        actionUpdate(data, () => {
                          setOnProcess(true);
                          getData();
                        })
                      }
                    >
                      edit
                    </span>
                  ) : null}
                  {actionDelete ? (
                    <span
                      className="danger material-icons-sharp"
                      style={{ margin: 5, cursor: "pointer" }}
                      onClick={() =>
                        actionDelete(data, () => {
                          setOnProcess(true);
                          getData();
                        })
                      }
                    >
                      delete
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="table-footer">
        <div className="table-paging">
          <label>
            Tampilkan{" "}
            <select
              style={{
                border: "1px solid #ccc",
                borderRadius: 16,
                padding: 5,
              }}
              onChange={(e) => {
                setShow(e.target.value);
                setOnProcess(true);
              }}
            >
              {list_show.map((number, i_show) => (
                <option key={i_show} value={number}>
                  {number}
                </option>
              ))}
            </select>{" "}
            data
          </label>
        </div>
        <div className="pagination">
          <div className="table-pagination">
            <a
              href="#"
              onClick={() => {
                if (paging > 1) {
                  setPaging(paging - 1);
                  setOnProcess(true);
                }
              }}
            >
              &laquo;
            </a>
            {[
              ...Array(
                lastPage >= range_paging * 2 + 1
                  ? range_paging * 2 + 1
                  : lastPage
              ).keys(),
            ].map((number) => {
              let page = number + 1;
              if (range_paging + 1 <= paging) {
                if (lastPage - range_paging <= paging) {
                  page = lastPage - (range_paging * 2 + 1) + page;
                } else {
                  const sisa = Math.abs(range_paging + 1 - paging);
                  page += sisa;
                }
              }
              return (
                <a
                  href="#"
                  key={number}
                  className={paging == page ? "active" : ""}
                  onClick={() => {
                    if (paging != page && page <= lastPage) {
                      setPaging(page);
                      setOnProcess(true);
                    }
                  }}
                >
                  {page}
                </a>
              );
            })}
            <a
              href="#"
              onClick={() => {
                if (paging < lastPage) {
                  setPaging(paging + 1);
                  setOnProcess(true);
                }
              }}
            >
              &raquo;
            </a>
          </div>
        </div>
      </div>
      <div
        style={{
          position: "fixed",
          display: onProcess ? "" : "none",
          width: "100%",
          height: "100%",
          zIndex: 999,
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "20%",
          }}
        >
          <ReactLoading
            type={"spin"}
            color={"#ccc"}
            height={"10%"}
            width={"10%"}
          />
        </div>
      </div>
    </div>
  );
};

export default Table;
