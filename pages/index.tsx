import type { NextPage } from "next";
import axios, { AxiosRequestConfig } from "axios";
import Head from "next/head";
import { Input } from "tw-elements";
import { ChangeEvent, MouseEvent, useState } from "react";
import SimpleProgressBar from "../components/common/SimpleProgressBar";

const Home: NextPage = () => {
  const [progress, setProgress] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const onFileUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;

    if (!fileInput.files) {
      alert("No file was chosen");
      return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
      alert("Files list is empty");
      return;
    }

    const file = fileInput.files[0];

    debugger;
    /** File validation */
    if (!file.type.startsWith("audio/wav")) {
      alert("Please select a valid audio file.");
      return;
    }

    /** Setting file state */
    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onCancelFile = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!previewUrl && !file) {
      return;
    }
    setFile(null);
    setPreviewUrl(null);
  };

  const onUploadFile = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!file) {
      return;
    }

    try {
      debugger;

      let startAt = Date.now();
      let formData = new FormData();
      formData.append("media", file);

      const options: AxiosRequestConfig = {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent: any) => {
          const { loaded, total } = progressEvent;

          // Calculate the progress percentage
          const percentage = (loaded * 100) / total;
          setProgress(+percentage.toFixed(2));

          // Calculate the progress duration
          const timeElapsed = Date.now() - startAt;
          const uploadSpeed = loaded / timeElapsed;
          const duration = (total - loaded) / uploadSpeed;
          setRemaining(duration);
        },
      };

      const {
        data: { data },
      } = await axios.post<{
        data: {
          url: string | string[];
        };
      }>("/api/upload", formData, options);

      console.log("File was uploaded successfylly:", data);
    } catch (e: any) {
      console.error(e);
      const error =
        e.response && e.response.data
          ? e.response.data.error
          : "Sorry! something went wrong.";
      alert(error);
    }
  };

  const onTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
  };

  const onCopy = async (e: MouseEvent<HTMLButtonElement>) => {
    if ("clipboard" in navigator) {
      await navigator.clipboard.writeText(text);
    } else {
      document.execCommand("copy", true, text);
    }
  };

  return (
    <div>
      <Head>
        <title>Speech To Text</title>
        <meta name="description" content="Speech To Text" />
      </Head>

      <main className="py-10">
        <div className="grid gap-4 grid-cols-2">
          <div className="w-full max-w-3xl px-3 mx-auto">
            <h1 className="mb-10 text-3xl font-bold text-gray-900">
              Upload your file
            </h1>

            <form
              className="w-full p-3 border border-gray-500 border-dashed"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="flex flex-col md:flex-row gap-1.5 md:py-4">
                <div className="flex-grow">
                  {previewUrl ? (
                    <div className="mx-auto w-80">
                      <h3>File Name: </h3> <h2>{file?.name}</h2>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-full py-3 transition-colors duration-150 cursor-pointer hover:text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-14 h-14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                        />
                      </svg>
                      <strong className="text-sm font-medium">
                        Select a file
                      </strong>
                      <input
                        className="block w-0 h-0"
                        name="file"
                        type="file"
                        onChange={onFileUploadChange}
                      />
                    </label>
                  )}
                </div>
                <div className="flex mt-4 md:mt-0 md:flex-col justify-center gap-1.5">
                  <button
                    disabled={!previewUrl}
                    onClick={onCancelFile}
                    className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
                  >
                    Cancel file
                  </button>
                  <button
                    disabled={!previewUrl}
                    onClick={onUploadFile}
                    className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
                  >
                    Upload file
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-3">
              <SimpleProgressBar progress={progress} remaining={remaining} />
            </div>
          </div>
          <div className="w-full max-w-3xl px-3 mx-auto">
            <div className="grid grid-flow-col">
              <div>
                <h1 className="mb-10 text-3xl font-bold text-gray-900">Text</h1>
              </div>
              <div className="text-right">
                <button
                  disabled={!text || text.length <= 0}
                  onClick={onCopy}
                  className="w-1/2 px-4 py-3 text-sm font-medium text-white transition-colors duration-300 bg-gray-700 rounded-sm md:w-auto md:text-base disabled:bg-gray-400 hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
            </div>

            <textarea
              id="taTranslatedText"
              rows={20}
              cols={100}
              className="border rounded"
              value={text}
              onChange={onTextChange}
            ></textarea>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
