import { withState, compose } from "recompose";

const timing_fn = "ease";
const duration = "300ms";
const enhance = compose(withState("direction", "changeDirection", "out"));

const getDirection = (event, object) => {
  const rect = object.getBoundingClientRect();
  const w = object.parentNode.offsetWidth,
    h = object.parentNode.offsetHeight,
    x =
      event.pageX - (rect.left + window.scrollX) - w / 2 * (w > h ? h / w : 1),
    y = event.pageY - (rect.top + window.scrollY) - h / 2 * (h > w ? w / h : 1),
    d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;

  return ["top", "right", "bottom", "left"][d];
};

const flip = ({ direction, changeDirection, backside, children }) => {
  let container;
  return (
    <div
      onClick={event => changeDirection(direction === "in" ? "out" : "in")}
      onMouseEnter={event => changeDirection("in")}
      onMouseLeave={event => changeDirection("out")}
      ref={input => {
        container = input;
      }}
      className={"flip " + (direction || "out")}
    >
      <div className="backside">{backside}</div>
      {children}
      <style jsx>{`
        .flip {
          height: 100%;
        }
        .backside {
          width: 100%;
          height: 100%;
          padding: 20px;
          position: absolute;
          top: 0;
          left: 0;
          /* pointer-events: none; */
          background-color: rgba(255, 255, 255, 0.9);
        }

        .out .backside {
          display: none;
        }

        .in .backside {
          display: block;
        }
      `}</style>
    </div>
  );
};

export default enhance(flip);
