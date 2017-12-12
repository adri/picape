import hoistNonReactStatic from "hoist-non-react-statics";
import React from "react";

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

export const mutateable = ({ mutationName = "mutate", handleErrors = true } = {}) => {
  return SourceComponent => {
    class Mutatable extends React.Component {
      state = {
        loading: false,
        error: "",
      };

      submit = variables => {
        this.setState({ loading: true, error: "" });

        return this.props[mutationName]({ variables })
          .then(res => {
            this.setState({ loading: false });

            return res;
          })
          .catch(error => {
            this.setState({ loading: false, error: error.message });

            if (handleErrors) {
              alert(error.message);
            }

            return Promise.reject(error);
          });
      };

      render() {
        return (
          <SourceComponent {...this.props} loading={this.state.loading} error={this.state.error} submit={this.submit} />
        );
      }
    }

    Mutatable.displayName = `Mutatable(${getDisplayName(SourceComponent)})`;
    hoistNonReactStatic(Mutatable, SourceComponent);

    return Mutatable;
  };
};
