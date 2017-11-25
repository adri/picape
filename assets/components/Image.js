export default ({ className, src, alt }) => {
  if (src) {
    src = src.replace("t_all_images", "t_all_images,f_auto,w_200,h_130,c_fill");
  }

  return <img className={className} src={src} alt={alt} />;
};
