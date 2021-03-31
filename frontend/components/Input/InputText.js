import React from "react";
import Colors from "../../constants/Colors";
import PropTypes from "prop-types";
import {
  Text,
  View,
  TextInput,
  Animated,
  Easing,
  Platform,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
const Icon = Ionicons;

class InputText extends React.Component {
  shakeAnimationValue = new Animated.Value(0);

  focus() {
    this.input.focus();
  }

  blur() {
    this.input.blur();
  }

  clear() {
    this.input.clear();
  }

  isFocused() {
    return this.input.isFocused();
  }

  setNativeProps(nativeProps) {
    this.input.setNativeProps(nativeProps);
  }

  shake = () => {
    const { shakeAnimationValue } = this;

    shakeAnimationValue.setValue(0);
    // Animation duration based on Material Design
    // https://material.io/guidelines/motion/duration-easing.html#duration-easing-common-durations
    Animated.timing(shakeAnimationValue, {
      duration: 375,
      toValue: 3,
      ease: Easing.bounce,
      useNativeDriver: true,
    }).start();
  };

  render() {
    const {
      containerStyle,
      disabled,
      disabledInputStyle,
      inputContainerStyle,
      leftIcon,
      leftIconContainerStyle,
      rightIcon,
      rightIconContainerStyle,
      InputComponent,
      inputStyle,
      errorProps,
      errorStyle,
      errorMessage,
      label,
      labelStyle,
      labelProps,
      renderErrorMessage,
      ...attributes
    } = this.props;

    const translateX = this.shakeAnimationValue.interpolate({
      inputRange: [0, 0.5, 1, 1.5, 2, 2.5, 3],
      outputRange: [0, -15, 0, 15, 0, -15, 0],
    });

    const hideErrorMessage = !renderErrorMessage && !errorMessage;

    return (
      <View style={StyleSheet.flatten([styles.container, containerStyle])}>
        <Text style={labelStyle} {...labelProps}>
          {label}
        </Text>

        <Animated.View
          style={StyleSheet.flatten([
            styles.inputContainer,
            inputContainerStyle,
            { transform: [{ translateX }] },
          ])}
        >
          {leftIcon && (
            <View
              style={StyleSheet.flatten([
                styles.iconContainer,
                leftIconContainerStyle,
              ])}
            >
              {leftIcon}
            </View>
          )}

          <InputComponent
            testID="RNE__Input__text-input"
            underlineColorAndroid="transparent"
            editable={!disabled}
            {...attributes}
            ref={(ref) => {
              this.input = ref;
            }}
            style={StyleSheet.flatten([
              styles.input,
              inputStyle,
              disabled && styles.disabledInput,
              disabled && disabledInputStyle,
            ])}
          />

          {rightIcon && (
            <View
              style={StyleSheet.flatten([
                styles.iconContainer,
                rightIconContainerStyle,
              ])}
            >
              {rightIcon}
            </View>
          )}
        </Animated.View>

        <Text
          {...errorProps}
          style={StyleSheet.flatten([
            styles.error,
            errorStyle && errorStyle,
            hideErrorMessage && {
              height: 0,
              margin: 0,
              padding: 0,
            },
          ])}
        >
          {errorMessage}
        </Text>
      </View>
    );
  }
}

InputText.propTypes = {
  containerStyle: PropTypes.object,
  disabled: PropTypes.bool,
  disabledInputStyle: PropTypes.object,
  // inputContainerStyle: PropTypes.object,
  leftIconContainerStyle: PropTypes.object,
  rightIconContainerStyle: PropTypes.object,
  // inputStyle: PropTypes.object,
  errorProps: PropTypes.object,
  errorStyle: PropTypes.object,
  errorMessage: PropTypes.string,
  label: PropTypes.node,
  // labelStyle: PropTypes.object,
  labelProps: PropTypes.object,
  renderErrorMessage: PropTypes.bool,
};

InputText.defaultProps = {
  InputComponent: TextInput,
  renderErrorMessage: true,
};

const styles = {
  container: {
    width: "100%",
  },
  disabledInput: {
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    alignItems: "center",
    borderColor: Colors.cardBackground,
  },
  iconContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingRight: 4,
    marginVertical: 4,
  },
  input: {
    alignSelf: "center",
    color: Colors.text,
    fontSize: 18,
    flex: 1,
    minHeight: 40,
  },
  error: {
    margin: 5,
    fontSize: 12,
    color: "red",
  },
  label: {
    fontSize: 16,
    color: Colors.text,
    ...Platform.select({
      default: {
        fontWeight: "bold",
      },
    }),
  },
};

export { InputText };
