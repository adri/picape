import hoistNonReactStatic from 'hoist-non-react-statics';
import React from 'react';

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

// See: https://facebook.github.io/react/docs/higher-order-components.html
export default function mutatable({ mutationName = 'mutate' } = {}) {
  return SourceComponent => {
    class Mutatable extends React.Component {
      state = {
        loading: false,
        error: '',
      };

      submit = (event, variables, { handleError, handleSuccess } = {}) => {
        event && event.preventDefault();

        this.setState({ loading: true, error: '' });

        return this.props[mutationName]({ variables })
          .then(() => {
            this.setState({ loading: false });
            if (handleSuccess) {
              handleSuccess();
            }
          })
          .catch(error => {
            this.setState({ loading: false, error: error.message });
            if (handleError) {
              handleError();
            }
          });
      };

      render() {
        return (
          <SourceComponent
            {...this.props}
            loading={this.state.loading}
            error={this.state.error}
            submit={this.submit}
          />
        );
      }
    }

    Mutatable.displayName = `Mutatable(${getDisplayName(SourceComponent)})`;
    hoistNonReactStatic(Mutatable, SourceComponent);
    return Mutatable;
  };
}
