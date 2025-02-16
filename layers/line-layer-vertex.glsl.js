// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

export default `\
#define SHADER_NAME line-layer-vertex-shader

attribute vec3 positions;
attribute vec3 instanceSourcePositions;
attribute vec3 instanceTargetPositions;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;
attribute float instanceTime;

uniform vec2 viewportSize;
uniform float strokeWidth;
uniform float opacity;
uniform float renderPickingBuffer;
uniform float innerTimeStart;
uniform float innerTimeEnd;

varying vec4 vColor;

// offset vector by strokeWidth pixels
// offset_direction is -1 (left) or 1 (right)
vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction) {
  // normalized direction of the line
  vec2 dir_screenspace = normalize(line_clipspace * viewportSize);
  // rotate by 90 degrees
  dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);

  vec2 offset_screenspace = dir_screenspace * offset_direction * strokeWidth / 2.0;
  vec2 offset_clipspace = offset_screenspace / viewportSize * 2.0;

  return offset_clipspace;
}

void main(void) {
  // if (instanceTime < innerTimeStart || instanceTime > innerTimeEnd) {
  //   gl_Position = vec4(0., 0., 0., 0.);
  //   //filteredOut = 0.;
  //   return;
  // }
  // Position
  vec3 sourcePos = project_position(instanceSourcePositions);
  vec3 targetPos = project_position(instanceTargetPositions);
  vec4 source = project_to_clipspace(vec4(sourcePos, 1.0));
  vec4 target = project_to_clipspace(vec4(targetPos, 1.0));

  // linear interpolation of source & target to pick right coord
  float segmentIndex = positions.x;
  vec4 p = mix(source, target, segmentIndex);

  // extrude
  vec2 offset = getExtrusionOffset(target.xy - source.xy, positions.y);
  gl_Position = p + vec4(offset, 0.0, 0.0);
  
  
  float finalOpacity;
  if (instanceTime < innerTimeStart || instanceTime > innerTimeEnd) {
    finalOpacity = 64.;
  } else {
    finalOpacity = 255.;
  }
  

  // Color
  vec4 color = vec4(instanceColors.rgb, finalOpacity) / 255.;
  vec4 pickingColor = vec4(instancePickingColors / 255., 1.);
  vColor = mix(
    color,
    pickingColor,
    renderPickingBuffer
  );
}
`;
