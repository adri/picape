import gql from "graphql-tag";
import Colors from "../../constants/Colors";
import Layout from "../../constants/Layout";
import { Input } from "./Input";
import PropTypes from "prop-types";
import React, { Component } from "react";
import {
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
const Icon = Ionicons;
const defaultSearchIcon = {
  size: 20,
  name: "ios-search",
  color: Colors.iconDefault,
};
const defaultClearIcon = {
  name: "ios-close-circle",
  size: 20,
  color: Colors.iconDefault,
};

// Based on react-native-elements SearchBar
class SearchBar extends Component {
  constructor(props) {
    super(props);
    const { value } = props;

    this.state = {
      hasFocus: props.autoFocus ? true : false,
      isEmpty: value ? value === "" : true,
      cancelButtonWidth: null,
    };
  }

  focus = () => {
    this.input.focus();
  };

  blur = () => {
    this.input.blur();
  };

  clear = () => {
    this.input.clear();
    this.onChangeText("");
  };

  cancel = () => {
    this.onChangeText("");

    if (this.props.showCancel) {
      UIManager.configureNextLayoutAnimation && LayoutAnimation.easeInEaseOut();
      this.setState({ hasFocus: false });
    }

    setTimeout(() => {
      this.blur();
      this.props.onCancel();
    }, 0);
  };

  onFocus = (event) => {
    this.props.onFocus(event);
    UIManager.configureNextLayoutAnimation && LayoutAnimation.easeInEaseOut();

    this.setState({
      hasFocus: true,
      isEmpty: this.props.value === "",
    });
  };

  onBlur = (event) => {
    this.props.onBlur(event);
    UIManager.configureNextLayoutAnimation && LayoutAnimation.easeInEaseOut();

    if (!this.props.showCancel) {
      this.setState({
        hasFocus: false,
      });
    }
  };

  onChangeText = (text) => {
    this.props.onChangeText(text);
    this.setState({ isEmpty: text === "" });
  };

  render() {
    const {
      cancelButtonProps,
      cancelButtonTitle,
      clearIcon,
      containerStyle,
      leftIconContainerStyle,
      rightIconContainerStyle,
      inputContainerStyle,
      inputStyle,
      placeholderTextColor,
      showLoading,
      loadingProps,
      searchIcon,
      showCancel,
      ...attributes
    } = this.props;
    const { hasFocus, isEmpty } = this.state;

    const { style: loadingStyle, ...otherLoadingProps } = loadingProps;

    const {
      buttonStyle,
      buttonTextStyle,
      color: buttonColor,
      disabled: buttonDisabled,
      buttonDisabledStyle,
      buttonDisabledTextStyle,
      ...otherCancelButtonProps
    } = cancelButtonProps;

    return (
      <View style={StyleSheet.flatten([styles.container, containerStyle])}>
        <Input
          testID="searchInput"
          renderErrorMessage={false}
          {...attributes}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onChangeText={this.onChangeText}
          ref={(input) => {
            this.input = input;
          }}
          inputStyle={StyleSheet.flatten([styles.input, inputStyle])}
          containerStyle={{
            paddingHorizontal: 0,
          }}
          inputContainerStyle={StyleSheet.flatten([
            styles.inputContainer,
            hasFocus && { marginRight: this.state.cancelButtonWidth },
            inputContainerStyle,
          ])}
          leftIcon={<Icon {...defaultSearchIcon} />}
          leftIconContainerStyle={StyleSheet.flatten([
            styles.leftIconContainerStyle,
            leftIconContainerStyle,
          ])}
          placeholderTextColor={placeholderTextColor}
          rightIcon={
            <View style={{ flexDirection: "row" }}>
              {showLoading && (
                <ActivityIndicator
                  key="loading"
                  style={StyleSheet.flatten([{ marginRight: 5 }, loadingStyle])}
                  {...otherLoadingProps}
                />
              )}
              {!isEmpty && (
                <Icon
                  {...{
                    ...defaultClearIcon,
                    key: "cancel",
                    onPress: this.clear,
                  }}
                />
              )}
            </View>
          }
          rightIconContainerStyle={StyleSheet.flatten([
            styles.rightIconContainerStyle,
            rightIconContainerStyle,
          ])}
        />

        {/* <View
          style={StyleSheet.flatten([
            styles.cancelButtonContainer,
            {
              opacity: this.state.cancelButtonWidth === null ? 0 : 1,
              right: hasFocus ? 0 : -this.state.cancelButtonWidth,
            },
          ])}
          onLayout={(event) =>
            this.setState({ cancelButtonWidth: event.nativeEvent.layout.width })
          }
        >
          <TouchableOpacity
            accessibilityRole="button"
            onPress={this.cancel}
            disabled={buttonDisabled}
            {...otherCancelButtonProps}
          >
            <View style={[buttonStyle, buttonDisabled && buttonDisabledStyle]}>
              <Text
                style={[
                  styles.buttonTextStyle,
                  buttonColor && { color: buttonColor },
                  buttonTextStyle,
                  buttonDisabled &&
                    (buttonDisabledTextStyle || styles.buttonTextDisabled),
                ]}
                disabled={buttonDisabled}
              >
                {cancelButtonTitle}
              </Text>
            </View>
          </TouchableOpacity>
        </View> */}
      </View>
    );
  }
}

SearchBar.propTypes = {
  value: PropTypes.string,
  cancelButtonProps: PropTypes.object,
  cancelButtonTitle: PropTypes.string,
  loadingProps: PropTypes.object,
  showLoading: PropTypes.bool,
  onCancel: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  onChangeText: PropTypes.func,
  containerStyle: PropTypes.object,
  leftIconContainerStyle: PropTypes.object,
  rightIconContainerStyle: PropTypes.object,
  inputContainerStyle: PropTypes.object,
  inputStyle: PropTypes.object,
  placeholderTextColor: PropTypes.string,
  showCancel: PropTypes.bool,
};

SearchBar.defaultProps = {
  value: "",
  cancelButtonTitle: "Cancel",
  loadingProps: {},
  cancelButtonProps: {},
  showLoading: false,
  onCancel: () => null,
  onFocus: () => null,
  onBlur: () => null,
  onChangeText: () => null,
  placeholderTextColor: Colors.secondaryText,
  searchIcon: defaultSearchIcon,
  clearIcon: defaultClearIcon,
  showCancel: false,
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "center",
  },
  input: {
    marginLeft: 6,
    overflow: "hidden",
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: Colors.cardBackground,
    borderRadius: 9,
    minHeight: 36,
  },
  rightIconContainerStyle: {
    marginRight: 8,
  },
  leftIconContainerStyle: {
    marginLeft: 8,
  },
  buttonTextStyle: {
    color: "#007aff",
    textAlign: "center",
    padding: 8,
    fontSize: 18,
  },
  buttonTextDisabled: {
    color: "#cdcdcd",
  },
  cancelButtonContainer: {
    position: "absolute",
  },
});

export default SearchBar;
