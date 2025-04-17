// 添加大窗文件输入框
function addMainFileInput() {
    const container = document.getElementById('mainFiles');
    const div = document.createElement('div');
    div.className = 'tag-input';
    div.innerHTML = `
        <input type="file" accept=".txt">
        <button class="danger" onclick="removeMainFileInput(this)">删除</button>
    `;
    container.appendChild(div);
}

// 批量添加大窗文件
function batchAddMainFiles() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.txt';
    
    input.onchange = function() {
        const container = document.getElementById('mainFiles');
        if (!container) return;
        // 清空现有的输入框
        container.innerHTML = '';
        
        // 为每个选择的文件创建一个输入框
        if (input.files) {
            Array.from(input.files).forEach(() => {
                addMainFileInput();
            });
            
            // 将文件分配给创建的输入框
            const fileInputs = container.querySelectorAll('input[type="file"]');
            Array.from(input.files).forEach((file, index) => {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                if (fileInputs[index] instanceof HTMLInputElement) {
                    fileInputs[index].files = dataTransfer.files;
                }
            });
        }
    };
    
    input.click();
}

// 删除大窗文件输入框
function removeMainFileInput(button) {
    const container = document.getElementById('mainFiles');
    if (container.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert('至少需要保留一个大窗文件输入框！');
    }
}

// 添加小窗文件输入框
function addFileInput() {
    const container = document.getElementById('subFiles');
    const div = document.createElement('div');
    div.className = 'tag-input';
    div.innerHTML = `
        <input type="file" accept=".txt" onchange="updateTagFromFilename(this)">
        <input type="text" placeholder="输入小窗标签（如：ho1小窗）" style="margin: 0 10px;">
        <button class="danger" onclick="removeFileInput(this)">删除</button>
    `;
    container.appendChild(div);
}

// 批量添加小窗文件
function batchAddSubFiles() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.txt';
    
    input.onchange = function() {
        const container = document.getElementById('subFiles');
        if (!container) return;
        // 清空现有的输入框
        container.innerHTML = '';
        
        // 为每个选择的文件创建一个输入框
        if (input.files) {
            Array.from(input.files).forEach(() => {
                addFileInput();
            });
            
            // 将文件分配给创建的输入框
            const fileInputs = container.querySelectorAll('input[type="file"]');
            Array.from(input.files).forEach((file, index) => {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                if (fileInputs[index] instanceof HTMLInputElement) {
                    fileInputs[index].files = dataTransfer.files;
                    // 触发文件名更新事件
                    const event = new Event('change');
                    fileInputs[index].dispatchEvent(event);
                }
            });
        }
    };
    
    input.click();
}

// 根据文件名自动更新标签
function updateTagFromFilename(fileInput) {
    if (fileInput.files && fileInput.files[0]) {
        const filename = fileInput.files[0].name;
        // 移除.txt扩展名并添加"小窗"后缀
        const baseName = filename.replace(/\.txt$/i, '').trim();
        // 如果文件名为空，则不添加后缀
        if (!baseName) return;
        
        const suggestedTag = `${baseName}小窗`;
        
        // 更新相邻的文本输入框
        const tagInput = fileInput.nextElementSibling;
        if (tagInput && tagInput.type === 'text') {
            tagInput.value = suggestedTag;
            // 触发input事件，以便其他可能的事件监听器能够响应
            const event = new Event('input', { bubbles: true });
            tagInput.dispatchEvent(event);
        }
    }
}

// 删除小窗文件输入框
function removeFileInput(button) {
    button.parentElement.remove();
}

// 读取文件内容
function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file, 'UTF-8');
    });
}

// 生成消息的唯一标识
function generateMessageKey(msg) {
    return `${msg.name}_${msg.qq}_${msg.timestampStr}_${msg.content}`;
}

// 解析消息
function parseMessage(line) {
    const timestampPattern = /(.*?)\((.*?)\) (\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})(.*)/;
    const match = line.match(timestampPattern);
    
    if (match) {
        const name = match[1].trim();
        const qq = match[2];
        const timestampStr = match[3];
        const content = match[4] ? match[4].trim() : '';
        const timestamp = new Date(timestampStr.replace(/\//g, '-'));
        return {
            timestamp,
            name,
            qq,
            content,
            timestampStr,
            originalLine: line
        };
    }
    return null;
}

// 生成分隔消息
function generateSeparatorMessage(type, source, timestamp) {
    const startQQ = "11111111";
    const endQQ = "99999999";
    const startTime = "1111/11/11 00:00:00";
    const endTime = "9999/01/01 00:00:00";
    
    const isStart = type === '开始';
    return {
        timestamp: timestamp || (isStart ? new Date('1111-11-11T00:00:00') : new Date('9999-01-01T00:00:00')),
        name: `【${source}消息${type}】`,
        qq: isStart ? startQQ : endQQ,
        timestampStr: isStart ? startTime : endTime,
        content: `\n-----------------------${source}消息${type}分割--------------------------`,
        isSystemMessage: true,
        sortIndex: isStart ? -1 : 1
    };
}

// 生成分割线消息
function generateDividerMessage(timestamp) {
    return {
        timestamp: timestamp || new Date('9999-01-01T00:00:00'),
        name: '-----------------------',
        qq: '99999999',
        timestampStr: '9999/01/01 00:00:00',
        content: '消息分割--------------------------',
        isDivider: true,
        sortIndex: 2  // 确保分割线在结束标记后
    };
}

// 处理单个文件
async function processFile(file, source = null) {
    const content = await readFile(file);
    const lines = content.split('\n');
    const messages = [];
    let currentMessage = null;
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        
        const message = parseMessage(trimmedLine);
        if (message) {
            if (currentMessage) {
                messages.push(currentMessage);
            }
            message.source = source;
            currentMessage = message;
        } else if (currentMessage) {
            currentMessage.content += '\n' + trimmedLine;
        }
    }
    
    if (currentMessage) {
        messages.push(currentMessage);
    }
    
    return messages;
}

// 格式化消息
function formatMessage(msg) {
    if (msg.isDivider) {
        return msg.name + msg.content;
    }
    
    let formattedMessage = '';
    
    // 添加来源信息（如果有）在开头
    if (msg.source && !msg.isSystemMessage) {
        formattedMessage += `【${msg.source}】 `;
    }
    
    // 添加名称、QQ和时间戳
    formattedMessage += `${msg.name}(${msg.qq}) ${msg.timestampStr}`;
    if (msg.content) {
        formattedMessage += msg.content;
    }
    
    return formattedMessage;
}

// 更新进度条
function updateProgress(percent) {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }
}

// 处理所有文件
async function processFiles() {
    /** @type {NodeListOf<HTMLInputElement>} */
    const mainFileInputs = document.querySelectorAll('#mainFiles .tag-input input[type="file"]');
    if (!mainFileInputs.length || !mainFileInputs[0].files[0]) {
        alert('请至少选择一个大窗消息文件！');
        return;
    }

    const processButtonElement = document.getElementById('processButton');
    if (!(processButtonElement instanceof HTMLButtonElement)) {
        console.error('处理按钮元素不存在或类型错误');
        return;
    }
    const processButton = processButtonElement;
    processButton.disabled = true;
    updateProgress(0);

    try {
        // 获取用户设置的时间间隔
        const timeWindowInput = document.getElementById('timeWindow');
        let timeWindowMinutes = 5; // 默认5分钟
        if (timeWindowInput instanceof HTMLInputElement) {
            const inputValue = parseInt(timeWindowInput.value);
            if (!isNaN(inputValue) && inputValue > 0) {
                timeWindowMinutes = inputValue;
            } else {
                timeWindowInput.value = '5'; // 重置为默认值
            }
        }
        const TIME_WINDOW = timeWindowMinutes * 60 * 1000; // 转换为毫秒

        let mainMessages = []; // 存储大窗消息
        const messagesBySource = new Map(); // 用于按小窗分组
        const seenMessages = new Set(); // 用于去重的集合
        
        // 处理所有大窗消息
        const totalMainFiles = mainFileInputs.length;
        for (let i = 0; i < totalMainFiles; i++) {
            const fileInput = mainFileInputs[i];
            if (fileInput.files[0]) {
                const messages = await processFile(fileInput.files[0]);
                // 对主窗口消息进行去重
                for (const message of messages) {
                    const messageKey = generateMessageKey(message);
                    if (!seenMessages.has(messageKey)) {
                        seenMessages.add(messageKey);
                        mainMessages.push(message);
                    }
                }
            }
            updateProgress(((i + 1) / totalMainFiles) * 40);
        }

        // 按时间排序主窗口消息
        mainMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        // 处理小窗消息
        const subFileInputs = document.querySelectorAll('#subFiles .tag-input');
        const totalSubFiles = subFileInputs.length;
        
        for (let i = 0; i < totalSubFiles; i++) {
            /** @type {HTMLInputElement} */
            const fileInput = subFileInputs[i].querySelector('input[type="file"]');
            /** @type {HTMLInputElement} */
            const tagInput = subFileInputs[i].querySelector('input[type="text"]');
            
            if (fileInput.files[0] && tagInput.value) {
                const messages = await processFile(fileInput.files[0], tagInput.value);
                if (!messagesBySource.has(tagInput.value)) {
                    messagesBySource.set(tagInput.value, []);
                }
                // 过滤掉已经在主窗口中出现的消息
                const uniqueMessages = messages.filter(message => {
                    const messageKey = generateMessageKey(message);
                    return !seenMessages.has(messageKey);
                });
                messagesBySource.get(tagInput.value).push(...uniqueMessages);
            }
            
            updateProgress(40 + ((i + 1) / totalSubFiles) * 50);
        }

        // 处理每个小窗的消息
        const processedGroups = []; // 存储处理后的消息组
        const messageGroups = []; // 存储所有小窗的消息组

        // 处理每个小窗的消息
        for (const [source, messages] of messagesBySource) {
            // 先按时间排序
            const sortedMessages = messages
                .filter(msg => !msg.isSystemMessage) // 过滤掉系统消息
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            
            let currentGroup = [];
            let lastMessageTime = null;

            for (const message of sortedMessages) {
                const currentTime = message.timestamp.getTime();

                if (lastMessageTime === null || (currentTime - lastMessageTime <= TIME_WINDOW)) {
                    currentGroup.push(message);
                } else {
                    // 如果当前组有消息，保存它
                    if (currentGroup.length > 0) {
                        messageGroups.push({
                            source,
                            messages: [...currentGroup],
                            firstMessageTime: currentGroup[0].timestamp.getTime(),
                            id: messageGroups.length
                        });
                    }
                    currentGroup = [message];
                }
                lastMessageTime = currentTime;
            }

            // 处理最后一组消息
            if (currentGroup.length > 0) {
                messageGroups.push({
                    source,
                    messages: [...currentGroup],
                    firstMessageTime: currentGroup[0].timestamp.getTime(),
                    id: messageGroups.length
                });
            }
        }

        // 按第一条消息的时间排序所有消息组
        messageGroups.sort((a, b) => a.firstMessageTime - b.firstMessageTime);

        // 处理小窗组的插入
        for (const group of messageGroups) {
            const groupWithMarkers = {
                startTime: group.firstMessageTime,
                endTime: group.messages[group.messages.length - 1].timestamp.getTime(),
                messages: [
                    generateSeparatorMessage('开始', group.source, new Date(group.firstMessageTime)),
                    ...group.messages,
                    generateSeparatorMessage('结束', group.source, new Date(group.messages[group.messages.length - 1].timestamp.getTime()))
                ]
            };
            processedGroups.push(groupWithMarkers);
        }

        // 合并所有消息
        const allMessages = [];
        let mainIndex = 0;
        let pendingMainMessages = []; // 存储待处理的主窗口消息

        // 合并主消息和小窗消息组，处理零散的主窗口消息
        for (let groupIndex = 0; groupIndex < processedGroups.length; groupIndex++) {
            const currentGroup = processedGroups[groupIndex];
            const nextGroup = groupIndex < processedGroups.length - 1 ? processedGroups[groupIndex + 1] : null;

            // 添加当前组之前的主窗口消息
            while (mainIndex < mainMessages.length && 
                   mainMessages[mainIndex].timestamp.getTime() < currentGroup.startTime) {
                pendingMainMessages.push(mainMessages[mainIndex++]);
            }

            // 处理待处理的主窗口消息
            if (pendingMainMessages.length > 0) {
                if (pendingMainMessages.length < 5) {
                    // 如果待处理消息少于5条，先不添加，继续累积
                } else {
                    // 如果超过5条，立即添加
                    allMessages.push(...pendingMainMessages);
                    pendingMainMessages = [];
                }
            }

            // 添加当前小窗消息组
            allMessages.push(...currentGroup.messages);

            // 如果是最后一个组或者与下一个组时间间隔较大，处理待处理的消息
            if (!nextGroup || (nextGroup.startTime - currentGroup.endTime > TIME_WINDOW)) {
                if (pendingMainMessages.length > 0) {
                    allMessages.push(...pendingMainMessages);
                    pendingMainMessages = [];
                }
            }

            // 收集当前组和下一组之间的主窗口消息
            if (nextGroup) {
                while (mainIndex < mainMessages.length && 
                       mainMessages[mainIndex].timestamp.getTime() < nextGroup.startTime) {
                    pendingMainMessages.push(mainMessages[mainIndex++]);
                }
            }
        }

        // 添加剩余的主窗口消息
        while (mainIndex < mainMessages.length) {
            allMessages.push(mainMessages[mainIndex++]);
        }

        // 添加最后剩余的待处理消息
        if (pendingMainMessages.length > 0) {
            allMessages.push(...pendingMainMessages);
        }

        // 格式化所有消息
        const output = allMessages.map(formatMessage).join('\n\n');
        
        // 创建下载链接
        const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '整理后的跑团记录.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // 显示预览
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            resultDiv.textContent = 
                '处理完成！文件已自动下载。\n\n' +
                `主窗口消息数：${mainMessages.length}\n` +
                `小窗消息组数：${processedGroups.length}\n` +
                `总消息数：${allMessages.length}\n\n` +
                '预览（前300个字符）：\n' + 
                output.substring(0, 300) + '...';
        }
        
        updateProgress(100);
    } catch (error) {
        alert('处理文件时出错：' + error.message);
        console.error(error);
    } finally {
        processButton.disabled = false;
    }
}

// 格式化日期
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
} 