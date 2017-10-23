import {withState, compose} from 'recompose';

const timing_fn = 'ease';
const duration = '300ms';
const enhance = compose(
    withState('direction', 'changeDirection', null),
);

const getDirection = (event, object) => {
    const rect = object.getBoundingClientRect()
    const w = object.parentNode.offsetWidth,
        h = object.parentNode.offsetHeight,
        x = (event.pageX - (rect.left + window.scrollX) - (w / 2) * (w > h ? (h / w) : 1)),
        y = (event.pageY - (rect.top + window.scrollY) - (h / 2) * (h > w ? (w / h) : 1)),
        d = Math.round(Math.atan2(y, x) / 1.57079633 + 5) % 4;

    return ['top', 'right', 'bottom', 'left'][d];
}

const flip = ({ direction, changeDirection, backside, children }) => {
    let container;

    return <div
        onMouseEnter={event => changeDirection('in-' + getDirection(event, container))}
        onMouseLeave={event => changeDirection('out-' + getDirection(event, container))}
        ref={(input) => { container = input; }}
        className={"flip " + direction}>
        <div className="backside">{backside}</div>
        {children}
        <style jsx>{`
        .flip {
          perspective: 400px;
          height: 100%;
        }
        .backside {
          transform: rotate3d(1,0,0, 90deg);
          backface-visibility: hidden;
          width: 100%;
          height: 100%;
          padding: 20px;
          position: absolute;
          top: 0;
          left: 0;
          /* pointer-events: none; */
          background-color: rgba(255, 255, 255, .9);
        }

        .in-top .backside {
           transform-origin: 50% 0%;
           animation: in-top ${duration} ${timing_fn} 0ms 1 forwards;
        }
        .in-right .backside {
          transform-origin: 100% 0%;
          animation: in-right ${duration} ${timing_fn} 0ms 1 forwards;
        }
        .in-bottom .backside {
          transform-origin: 50% 100%;
          animation: in-bottom ${duration} ${timing_fn} 0ms 1 forwards;
        }
        .in-left .backside {
          transform-origin: 0% 0%;
          animation: in-left ${duration} ${timing_fn} 0ms 1 forwards;
        }

        .out-top .backside {
          transform-origin: 50% 0%;
          animation: out-top ${duration} ${timing_fn} 0ms 1 forwards;
        }
        .out-right .backside {
          transform-origin: 100% 50%;
          animation: out-right ${duration} ${timing_fn} 0ms 1 forwards;
        }
        .out-bottom .backside {
          transform-origin: 50% 100%;
          animation: out-bottom ${duration} ${timing_fn} 0ms 1 forwards;
        }
        .out-left .backside {
          transform-origin: 0% 0%;
          animation: out-left ${duration} ${timing_fn} 0ms 1 forwards;
        }

        @keyframes in-top {
          from {transform: rotate3d(-1,0,0, 90deg)}
          to   {transform: rotate3d(0,0,0, 0deg)}}
        @keyframes in-right {
          from {transform: rotate3d(0,-1,0, 90deg)}
          to   {transform: rotate3d(0,0,0, 0deg)}}
        @keyframes in-bottom {
          from {transform: rotate3d(1,0,0, 90deg)}
          to   {transform: rotate3d(0,0,0, 0deg)}}
        @keyframes in-left {
          from {transform: rotate3d(0,1,0, 90deg)}
          to   {transform: rotate3d(0,0,0, 0deg)}}

        @keyframes out-top {
          from {transform: rotate3d(0,0,0, 0deg)}
          to   {transform: rotate3d(-1,0,0, 130deg)}}
        @keyframes out-right {
          from {transform: rotate3d(0,0,0, 0deg)}
          to   {transform: rotate3d(0,-1,0, 130deg)}}
        @keyframes out-bottom {
          from {transform: rotate3d(0,0,0, 0deg)}
          to   {transform: rotate3d(1,0,0, 130deg)}}
        @keyframes out-left {
          from {transform: rotate3d(0,0,0, 0deg)}
          to   {transform: rotate3d(0,1,0, 130deg)}}
        `}</style>
    </div>;
}

export default enhance(flip);
