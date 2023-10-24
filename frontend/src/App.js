import './App.css';
import { useEffect, useState, useRef } from 'react';
import { Dna } from 'react-loader-spinner';

function App() {
  const [theme, setTheme] = useState("light")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [number, setNumber] = useState(1)
  const [separator, setSeparator] = useState(" ")
  const resultRef = useRef(null);
  const [fav, setFav] = useState(() => {
    // getting stored value
    const saved = localStorage.getItem("fav");
    const initialValue = JSON.parse(saved);
    return initialValue || [];
  });
  const [anim, setAnim] = useState(false)

  const colors = {
    light: {
      '--color-background': 'rgb(255, 167, 45)',
      '--color-text': 'rgb(2, 48, 71)',
      '--color-foreground': '#ff5f6d',
      '--color-border': 'rgb(255, 184, 3)',
      '--color-textLight': 'rgb(48, 88, 108)'
    },
    dark: {
      '--color-background': 'rgba(27, 33, 80, 1)',
      '--color-text': 'rgba(210, 210, 210, 1)',
      '--color-foreground': 'rgba(17, 11, 54, 1)',
      '--color-border': 'rgba(41, 37, 89, 1)',
      '--color-textLight': 'rgb(63, 73, 152)'
    }
  }

  useEffect(() => {
    Object.keys(colors[theme]).forEach((key) => {
      let cssKey = `${key}`
      let cssValue = colors[theme][key]
      document.body.style.setProperty(cssKey, cssValue)
    })
  }, [theme])

  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.style.height = `auto`;
      const height = resultRef.current.scrollHeight;
      resultRef.current.style.height = `0px`;

      setTimeout(() => {
        resultRef.current.style.height = `${height}px`;
      }, 300);
    }
  }, [anim]);

  function measureCanvasHeight(ctx, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';

    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    return y
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = text.split(' ');
    var line = '';

    for (var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  async function openModal(item) {
    //draw on canvas
    let context = document.getElementById("canvas").getContext("2d")

    //font size for measurment
    context.font = "normal 36px Courier New";
    let canvasHeight = measureCanvasHeight(context, item, 25, 120, context.canvas.width - 20, 40)
    context.canvas.height = canvasHeight + 40

    //window content
    let grd = context.createLinearGradient(0, 0, 0, 400);
    grd.addColorStop(0, "#16222A");
    grd.addColorStop(1, "#3A6073");
    context.beginPath();
    context.roundRect(0, 0, context.canvas.width, context.canvas.height, 20);
    context.fillStyle = grd
    context.fill()

    //window buttons
    context.beginPath();
    context.arc(20, 20, 6, 0, 2 * Math.PI, false);
    context.fillStyle = '#FF605C';
    context.fill();

    context.beginPath();
    context.arc(40, 20, 6, 0, 2 * Math.PI, false);
    context.fillStyle = '#FFBD44';
    context.fill();

    context.beginPath();
    context.arc(60, 20, 6, 0, 2 * Math.PI, false);
    context.fillStyle = '#00CA4E';
    context.fill();

    //adress text
    context.font = "normal 14px Courier New";
    context.fillStyle = "#FAFAFA"
    context.textAlign = "center";
    context.fillText("generated with: " + window.location.href, context.canvas.width / 2 + 30, 22.5);

    //header text
    context.textAlign = "left";
    context.font = "bold 18px Courier New";
    context.fillText("Hi, my name is:", 25, 70);

    //name
    context.font = "normal 36px Courier New";
    wrapText(context, item, 25, 120, context.canvas.width - 20, 40)

    document.getElementById("canvasModal").showModal()
  }

  function closeModal() {
    let context = document.getElementById("canvas").getContext("2d")
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    document.getElementById("canvasModal").close()
  }

  function downloadCanvas() {
    let canvas = document.getElementById("canvas")
    let link = document.getElementById('downloadCanvas');
    link.setAttribute('download', 'my-generated-name.png');
    link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
    link.click();
  }

  async function shareCanvas() {
    let canvas = document.getElementById("canvas")
    let base64url = canvas.toDataURL("image/png")
    let blob = await (await fetch(base64url)).blob();
    let file = new File([blob], 'my-generated-name.png', { type: blob.type });
    navigator.share({
      text: 'Check out this image!',
      files: [file],
    })
  }

  async function sendReq() {
    resultRef.current.style.height = `0px`;
    setLoading(true)
    let req = await fetch(`${process.env.REACT_APP_URL}/get?separator=${separator}&count=${number}`)
    if (req.ok) {
      let data = await req.json()
      setData(data)
      setAnim(prev => !prev)
    }
    setLoading(false)
  }

  function addToFav(item) {
    setFav([...fav, item])
    setData(data.filter(a => a !== item));
    localStorage.setItem("fav", JSON.stringify([...fav, item]))
  }
  function deleteFromFav(item) {
    setFav(fav.filter(a => a !== item));
    setData([...data, item])
    localStorage.setItem("fav", JSON.stringify(fav.filter(a => a !== item)))
  }

  return (
    <div className="App">

      <div className='row1'>
        <div className="theme">
          <button onClick={() => setTheme(theme == "light" ? "dark" : "light")}>
            {theme == "dark" ? <span>🌗</span> : <span>☀️</span>}
          </button>
        </div>
      </div>

      <div className='row2'>
        <div className="window">

          <div className="title">
            Generate your fancy name
          </div>

          <div className="content">
            <div className='options'>
              <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px' }}>
                <label htmlFor="number">number of names (max 20):</label>
                <input id="number" type='number' min={1} max={20} value={number} onChange={(v) => setNumber(v.target.value)} />
              </div>
              <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px' }}>
                <label htmlFor='separator'>word-separator (default spacebar):</label>
                <input id="separator" maxLength={1} value={separator} onFocus={() => setSeparator("")} onChange={(v) => setSeparator(v.target.value)} />
              </div>
            </div>
            <div className='result' ref={resultRef} style={{}}>

              {fav?.map((element, index) =>
                <div key={element} style={{}}><p></p><p style={{ flex: 1 }}>{element}</p>
                  <p onClick={() => openModal(element)}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="14pt" viewBox="0 0 448 512"><path d="M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3V320c0 17.7 14.3 32 32 32s32-14.3 32-32V109.3l73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 53 43 96 96 96H352c53 0 96-43 96-96V352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V352z" /></svg>
                  </p>
                  <p onClick={() => fav.includes(element) ? deleteFromFav(element) : addToFav(element)}>
                    {fav.includes(element) ?
                      <svg xmlns="http://www.w3.org/2000/svg" height="14pt" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" /></svg> :

                      <svg xmlns="http://www.w3.org/2000/svg" height="14pt" viewBox="0 0 512 512"><path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" /></svg>
                    }
                  </p>
                </div>
              )}

              {data.length == 0 && <div className='example'>{"your generated name example".replaceAll(" ", separator)}</div>}
              {data?.map((element, index) =>
                <div key={element} style={{}}><p>{index + 1 + ". "}</p><p style={{ flex: 1 }}>{element}</p>
                  <p onClick={() => openModal(element)}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="14pt" viewBox="0 0 448 512"><path d="M246.6 9.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 109.3V320c0 17.7 14.3 32 32 32s32-14.3 32-32V109.3l73.4 73.4c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-128-128zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 53 43 96 96 96H352c53 0 96-43 96-96V352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V352z" /></svg>
                  </p>
                  <p onClick={() => fav.includes(element) ? deleteFromFav(element) : addToFav(element)}>
                    {fav.includes(element) ?
                      <svg xmlns="http://www.w3.org/2000/svg" height="14pt" viewBox="0 0 512 512"><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" /></svg> :

                      <svg xmlns="http://www.w3.org/2000/svg" height="14pt" viewBox="0 0 512 512"><path d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z" /></svg>
                    }
                  </p>
                </div>
              )}
            </div>
            <div className='generate'>
              <button disabled={loading && true} onClick={() => [sendReq()]}>
                {loading ? <Dna
                  visible={true}
                  height="100%"
                  width="100%"
                  ariaLabel="dna-loading"
                  wrapperStyle={{}}
                  wrapperClass="dna-wrapper"
                /> : 'generate'}
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className='row3'>
        <div className="links">
          <button onClick={() => window.open("https://github.com/nicramu", '_blank').focus()}>
            <svg xmlns="http://www.w3.org/2000/svg" height="32px" fill='#fff' viewBox="0 0 496 512"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" /></svg>
          </button>
        </div>
      </div>


      <dialog id='canvasModal'>
        <canvas id="canvas" width={500} height={300} />
        <div>
          <button onClick={() => closeModal()}>close</button>
          <button id='link' onClick={() => downloadCanvas()}>download</button>
          {navigator.canShare &&
            <button id='link' onClick={() => shareCanvas()}>share</button>
          }
        </div>
        <a id='downloadCanvas' />
      </dialog>


    </div>
  );
}


export default App;